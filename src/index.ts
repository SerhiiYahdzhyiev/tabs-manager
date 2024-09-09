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

// INFO: Globals
var envType: EnvironmentType;
var _tabs;

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
        private _idToTab = new Map<number, chrome.tabs.Tab>();
        private _tabs: chrome.tabs.Tab[] = []

        private _asserTabId(tab: chrome.tabs.Tab): boolean {
            if (!tab.id) {
                return false;
            }
            return true;
        }

        private createListener = (tab: chrome.tabs.Tab) => {
            this._tabs = [...this._tabs, tab];
            if (!this._asserTabId(tab)) {
                console.warn("Skipping tab without id!");
                console.warn("This tab will not be saved in id->tab map!");
                console.dir(tab);
                return;
            }
            this._idToTab.set(tab.id!, tab);
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
            if (this._asserTabId(tab)) {
                this._idToTab.set(id, tab);
            }
        };

        private removeListener = (id: number) => {
            this._tabs = this._tabs.filter(t => t.id !== id);
            this._idToTab.delete(id);
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
                    }
                );
            });
        }
    }

    // INFO: Globals assignment...
    envType = getEnvType();
    _tabs = new Tabs();
})();
