"use strict";

const requiredPermissions = [
    "tabs",
    "activeTab",
];

enum EnvironmentType {
    WINDOW="window",
    WORKER="worker",
    INVALID="invalid",
};

function getEnvType(): EnvironmentType {
    const gThis = String(globalThis);
    if (gThis.match(/worker/ig)) {
        return EnvironmentType.WORKER
    } else if (gThis.match(/window/ig)) {
        return EnvironmentType.WINDOW
    }
    console.warn("Environment detection failed!");
    return EnvironmentType.INVALID
}

function assertEnv(type: EnvironmentType): boolean {
    switch(type) {
        case EnvironmentType.WINDOW:
            return !!(
                //@ts-ignore
                (browser && browser.tabs) ||
                (chrome && chrome.tabs)
        );
        case EnvironmentType.WORKER:
            return !!(
                (chrome && chrome.tabs) ||
                //@ts-ignore
                (browser && browser.tabs)
        );
    }
    return false;
}

function getTabs() {
    if (typeof chrome !== "undefined") {
        return chrome.tabs;
    }
    //@ts-ignore
    return browser?.tabs;
}

function getRuntime() {
    if (typeof chrome !== "undefined") {
        return chrome.runtime;
    }
    //@ts-ignore
    return browser.runtime;
}

function ensureClosingSlash(url: string): string {
    const lastChar = url.split("").toReversed()[0];
    if (lastChar === "/") {
        return url;
    }
    return url + "/";
}

(() => {
    if (!assertEnv(getEnvType())) {
        console.warn("This environment is not suitable for TabsManager!");
        return 1;
    }

    const manifestPermissions = getRuntime().getManifest()["permissions"];

    const requiredPermissionsGranted = requiredPermissions
        .every(permission => manifestPermissions.includes(permission))

    if (!requiredPermissionsGranted) {
        console.warn("This extension does not have a required permissions for TabsManager!");
        return 1;
    }

    class Tabs {
        private _urlToId = new Map<string, number>();
        private _idToTab = new Map<number, chrome.tabs.Tab>();
        private _tabs: chrome.tabs.Tab[] = []

        private _assertTabId(tab: chrome.tabs.Tab): boolean {
            if (!tab.id) {
                return false;
            }
            return true;
        }

        private _assertTabUrl(tab: chrome.tabs.Tab): boolean {
            if (!tab.url && !tab.pendingUrl) {
                return false;
            }
            return true;
        }

        private createListener = (tab: chrome.tabs.Tab) => {
            this._tabs = [...this._tabs, tab];
            if (!this._assertTabId(tab)) {
                console.warn("Skipping tab without id!");
                console.warn("This tab will not be saved in id->tab map!");
                console.dir(tab);
                return;
            }
            this._idToTab.set(tab.id!, tab);
            if (!this._assertTabUrl(tab)) {
                console.warn("Skipping tab without both url and pendingUrl!");
                console.warn("This tab will not be saved in url->tab map!");
                return;
            }
            const url: string = (tab.url || tab.pendingUrl)!
            this._urlToId.set(url, tab.id! );
        }

        private updateListener = (
            id: number,
            changeInfo: Record<string, string|number>,
            tab: chrome.tabs.Tab,
        ) => {
            let old = this._tabs.find(t => t.id === id)!;
            if (!old) {
                console.warn(id);
                throw Error("Failed to find updated tab by id!")
            }
            Object.assign(old, changeInfo);
            if (this._assertTabId(tab)) {
                this._idToTab.set(id, tab);
            }
            if (this._assertTabUrl(tab)) {
                const url: string = (tab.url || tab.pendingUrl)!
                this._urlToId.set(url, id);
            }
        };

        private removeListener = (id: number) => {
            this._tabs = this._tabs.filter(t => t.id !== id);
            this._idToTab.delete(id);
            // TODO: Find a more performant way to do this...
            for (const [k,v] of this._urlToId.entries()) {
                if (v === id) {
                    this._urlToId.delete(k);
                }
            }
        }

        public getTabById(id: number): chrome.tabs.Tab | null {
            return this._idToTab.get(id) || null;
        }

        public getTabByUrl(url: string): chrome.tabs.Tab | null {
            const id = this._urlToId.get(ensureClosingSlash(url));
            if (id) return this._idToTab.get(id)!;
            return null;
        }

        public getIdBy(url: string): number {
            return this._urlToId.get(url) || -1;
        }

        public get(key: string|number): chrome.tabs.Tab | null {
            if (typeof key === "number") {
                return this.getTabById(key);
            }
            if (typeof key ==="string") {
                let candidate: chrome.tabs.Tab | null = null;
                if (!isNaN(+key) && +key > 0) {
                    candidate = this.getTabById(+key);
                }
                if (!candidate) candidate = this.getTabByUrl(key);
                return candidate;
            }
            return null;
        }

        public hasId(id: number) {
            return this._idToTab.has(id);
        }

        public hasUrl(url: string) {
            return this._urlToId.has(ensureClosingSlash(url));
        }

        public has(key: string|number): boolean {
            if (typeof key === "number") {
                return this._idToTab.has(key);
            }
            if (typeof key ==="string") {
                let a: boolean = false,
                    b: boolean;
                if (!isNaN(+key) && +key > 0) {
                     a = this._idToTab.has(+key);
                }
                b = this._urlToId.has(ensureClosingSlash(key));
                return a || b;
            }
            return false;
        }

        constructor() {
            const tabs = getTabs();
            tabs.onCreated.addListener(this.createListener.bind(this));
            tabs.onUpdated.addListener(this.updateListener.bind(this));
            tabs.onRemoved.addListener(this.removeListener.bind(this));
            tabs.query({}, (tabs: any) => {
                this._tabs = tabs
                tabs.map(
                    (tab: chrome.tabs.Tab) => {
                        this._idToTab.set(tab.id!, tab);
                        const url = (tab.url || tab.pendingUrl)!;
                        this._urlToId.set(url, tab.id!);
                    }
                );
            });
        }
    }


    // INFO: Globals assignment...
    Object.assign(globalThis, {envType: getEnvType()});
    Object.assign(globalThis, {_tabs: new Tabs()});

})();
