"use strict";

import { Tab } from "./tab";

const requiredPermissions = ["tabs", "activeTab"];

enum EnvironmentType {
  WINDOW = "window",
  WORKER = "worker",
  INVALID = "invalid",
}

function getEnvType(): EnvironmentType {
  const gThis = String(globalThis);
  if (gThis.match(/worker/gi)) {
    return EnvironmentType.WORKER;
  } else if (gThis.match(/window/gi)) {
    return EnvironmentType.WINDOW;
  }
  console.warn("Environment detection failed!");
  return EnvironmentType.INVALID;
}

function assertEnv(type: EnvironmentType): boolean {
  switch (type) {
    case EnvironmentType.WINDOW:
      return !!(
        //@ts-ignore
        ((browser && browser.tabs) || (chrome && chrome.tabs))
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

  const requiredPermissionsGranted = requiredPermissions.every((permission) =>
    manifestPermissions.includes(permission),
  );

  if (!requiredPermissionsGranted) {
    console.warn(
      "This extension does not have a required permissions for TabsManager!",
    );
    return 1;
  }

  class Tabs {
    private _urlToId = new Map<string, number>();
    private _idToTab = new Map<number, Tab>();
    private _tabs: Tab[] = [];

    private _assertTabId(tab: Tab): boolean {
      if (!tab.id) {
        return false;
      }
      return true;
    }

    private _assertTabUrl(tab: Tab): boolean {
      if (!tab.url && !tab.pendingUrl) {
        return false;
      }
      return true;
    }

    private createListener = (tab: chrome.tabs.Tab) => {
      const wrappedTab = new Tab(tab);
      this._tabs = [...this._tabs, wrappedTab];
      if (!this._assertTabId(wrappedTab)) {
        console.warn("Skipping tab without id!");
        console.warn("This tab will not be saved in id->tab map!");
        console.dir(tab);
        return;
      }
      this._idToTab.set(tab.id!, wrappedTab);
      if (!this._assertTabUrl(wrappedTab)) {
        console.warn("Skipping tab without both url and pendingUrl!");
        console.warn("This tab will not be saved in url->tab map!");
        return;
      }
      const url: string = (wrappedTab.url || wrappedTab.pendingUrl)!;
      this._urlToId.set(url, wrappedTab.id!);
    };

    private updateListener = (
      id: number,
      changeInfo: Record<string, string | number>,
      tab: chrome.tabs.Tab,
    ) => {
      if (!this.hasId(id)) {
        console.warn(id);
        throw Error("Failed to find updated tab by id!");
      }
      const _tab = this.getTabById(id)!;
      if ("url" in changeInfo || "pendingUrl" in changeInfo) {
        const url = (_tab.url || _tab.pendingUrl)!;
        this._urlToId.delete(url);
      }
      Object.assign(_tab, changeInfo);
      if (this._assertTabUrl(_tab)) {
        const url: string = (_tab.url || _tab.pendingUrl)!;
        this._urlToId.set(url, id);
      }
    };

    private removeListener = (id: number) => {
      this._tabs = this._tabs.filter((t) => t.id !== id);
      this._idToTab.delete(id);
      // TODO: Find a more performant way to do this...
      for (const [k, v] of this._urlToId.entries()) {
        if (v === id) {
          this._urlToId.delete(k);
        }
      }
    };

    public getTabById(id: number): Tab | null {
      return this._idToTab.get(id) || null;
    }

    public getTabByUrl(url: string): Tab | null {
      const id = this._urlToId.get(ensureClosingSlash(url));
      if (id) return this._idToTab.get(id)!;
      return null;
    }

    public getIdBy(url: string): number {
      return this._urlToId.get(url) || -1;
    }

    public get(key: string | number): Tab | null {
      if (typeof key === "number") {
        return this.getTabById(key);
      }
      if (typeof key === "string") {
        let candidate: Tab | null = null;
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

    public has(key: string | number): boolean {
      if (typeof key === "number") {
        return this._idToTab.has(key);
      }
      if (typeof key === "string") {
        let a: boolean = false;
        if (!isNaN(+key) && +key > 0) {
          a = this._idToTab.has(+key);
        }
        const b = this._urlToId.has(ensureClosingSlash(key));
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
        this._tabs = tabs.map((t: chrome.tabs.Tab) => new Tab(t));
        this._tabs.map((tab: Tab) => {
          this._idToTab.set(tab.id!, tab);
          const url = (tab.url || tab.pendingUrl)!;
          this._urlToId.set(url, tab.id!);
        });
      });
    }
  }

  // INFO: Globals assignment...
  Object.assign(globalThis, { envType: getEnvType() });
  Object.assign(globalThis, { _tabs: new Tabs() });

  class TabsManager {
    constructor(options: Record<string, any>) {
      // TODO: Make an actual use of options...
      console.log(options);

      const browserTabs = getTabs();

      Object.assign(this, {
        create: browserTabs.create,
        connect: browserTabs.connect,
        discard: browserTabs.discard,
        remove: browserTabs.remove,
        reload: browserTabs.reload,
        update: browserTabs.update,
      });
    }

    public static withTabs<ReturnType>(
      cb: (tabs: Tabs, ...args: any[]) => ReturnType,
    ): (...args: any[]) => ReturnType {
      return (...args: any[]) => {
        //@ts-ignore
        return cb(_tabs._tabs, ...args);
      };
    }

    public getAll(): Tab {
      //@ts-ignore
      return _tabs._tabs;
    }

    public get(key: string | number): Tab | null {
      //@ts-ignore
      return _tabs.get(key);
    }

    public has(key: string | number): boolean {
      //@ts-ignore
      return _tabs.has(key);
    }
  }

  Object.assign(globalThis, { TabsManager: TabsManager });
})();
