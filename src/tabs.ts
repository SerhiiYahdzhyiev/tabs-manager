import { Browser } from "./api";

import { Tab } from "./tab";

import { TabsMapOneToMany } from "./types";
import { ITabMaps } from "./interfaces";

declare const __maps__: ITabMaps;

import {
  sleep,
  simpleOneToOneMapUpdater,
  stringToIdsMapUpdater,
} from "./utils";

export class Tabs {
  private __debug__ = false;
  private _activeId = 0;

  private _urlToIds = new Map<string, number[]>();
  private _hostToIds = new Map<string, number[]>();
  private _idToTab = new Map<number, Tab>();
  private _idxToTab = new Map<number, Tab>();
  protected _tabs: Tab[] = [];

  private _updatingIndecies = false;

  private async updateIndecies() {
    while (this._updatingIndecies) {
      this.log("Waiting for updating indecies lock release...");
      await sleep(100);
    }
    await this._updateIndecies();
  }

  private async _updateIndecies() {
    this.log("Updating indecies...");
    this._updatingIndecies = true;
    try {
      // INFO: Probably rebuilding the entire map is not the efficient way,
      //       but I've struggled to write it differently without introducing
      //       internal structures' consistency bugs...
      // TODO: Try to write more efficient updating algorithm...
      this._idxToTab.clear();
      for (const tab of this._tabs) {
        const internalIdx = tab.index;
        this.log("Internal index: " + internalIdx);
        const realIdx = (await Browser.getTabs().get(tab.id)).index;
        this.log("Real index: " + realIdx);
        tab.index = realIdx;
        __maps__.updateMap("idxToTab", realIdx, tab);
      }
    } finally {
      this._updatingIndecies = false;
    }
  }

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

  private log(...args: unknown[]) {
    if (this.__debug__) console.log(...args);
  }

  private createListener = async (tab: chrome.tabs.Tab) => {
    this.log("Created!");
    const wrappedTab = new Tab(tab);
    this._tabs = [...this._tabs, wrappedTab];
    this._idxToTab.set(this._tabs.length - 1, wrappedTab);
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
    __maps__.updateMap("urlToIds", url, wrappedTab.id);

    const host = wrappedTab.urlObj?.host;
    if (host) {
      __maps__.updateMap("hostToIds", host, wrappedTab.id!);
    } else {
      console.warn("Failed to get host on wrapped tab!");
    }
    await this.updateIndecies();
  };

  private updateListener = (
    id: number,
    changeInfo: chrome.tabs.TabChangeInfo,
  ) => {
    this.log("Updated!");
    this.log(id, changeInfo);

    const discarded =
      "discarded" in changeInfo && changeInfo.discarded === true;

    if (discarded) return;

    const urlChanged = "url" in changeInfo || "pendingUrl" in changeInfo;

    if (!this.hasId(id)) {
      console.warn(id);
      throw Error("Failed to find updated tab by id!");
    }

    const tab = this.getTabById(id)!;

    if (urlChanged) {
      const url: string = (tab.url || tab.pendingUrl)!;
      // INFO: Remove id from old url entry...
      __maps__.updateMap("urlToIds", url, tab.id);

      const oldHost = tab.urlObj?.host;
      const newHost = new URL(changeInfo.url ?? "").host;

      if (newHost && newHost !== oldHost) {
        if (oldHost) __maps__.updateMap("hostToIds", oldHost, tab.id!);
        __maps__.updateMap("hostToIds", newHost, tab.id!);
      }
    }

    Object.assign(tab, changeInfo);

    if (urlChanged && this._assertTabUrl(tab)) {
      const url: string = (tab.url || tab.pendingUrl)!;
      __maps__.updateMap("urlToIds", url, tab.id);
    }
  };

  private movedListener = async () => {
    await this.updateIndecies();
  };

  private removeListener = async (id: number) => {
    this.log("Removed!");
    const oldTab = this.getTabById(id)!;

    const host = oldTab?.urlObj?.host;
    if (host && this._hostToIds.has(host)) {
      __maps__.updateMap("hostToIds", host, id);
    } else {
      console.warn("Failed to get host removed tab!");
    }

    this._tabs = this._tabs.filter((t) => t.id !== id);
    const url = (oldTab.url || oldTab.pendingUrl)!;
    if (this._urlToIds.has(url)) {
      __maps__.updateMap("urlToIds", url, id);
    }
    __maps__.updateMap("idToTab", id, null);
    await this.updateIndecies();
  };

  public getTabById(id: number): Tab | null {
    return this._idToTab.get(id) || null;
  }

  public getTabsByUrl(url: string): Tab[] {
    try {
      new URL(url);
    } catch {
      console.warn("Invalid url: " + url);
      return [];
    }
    const ids = this._urlToIds.get(url);
    if (ids && ids.length) {
      const result: Tab[] = [];
      for (const id of ids) {
        result.push(this.getTabById(id)!);
      }
      return result;
    }
    return [];
  }

  public getIdsBy(url: string): number[] {
    return this._urlToIds.get(url) || [];
  }

  public get(key: string | number): Tab | Tab[] | null {
    if (typeof key === "number") {
      return this.getTabById(key);
    }
    if (typeof key === "string") {
      let candidate: Tab | Tab[] | null = null;
      if (!isNaN(+key) && +key > 0) {
        candidate = this.getTabById(+key);
      }
      if (!candidate) {
        candidate = this.getTabsByUrl(key);
      }
      return candidate;
    }
    return null;
  }

  public hasId(id: number) {
    return this._idToTab.has(id);
  }

  public hasUrl(url: string) {
    try {
      new URL(url);
    } catch {
      console.warn("Invalid url: " + url);
      return false;
    }
    return this._urlToIds.has(url);
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
      const b = this.hasUrl(key);
      return a || b;
    }
    return false;
  }

  private async activatedListener(info: chrome.tabs.TabActiveInfo) {
    this.log("Updating active tab...");
    this.log("Current activateId: " + this._activeId);
    this.log("Tab Active info: ");
    this.log(info);
    if (this._activeId && this._activeId !== info.tabId) {
      const tab = this.get(this._activeId) as Tab;
      if (tab) {
        await this.updateIndecies();
        this.log("Tab:");
        this.log(tab);
        this.log("_tabs[tab.index]:");
        this.log(this._tabs[tab.index]);
        this._tabs[tab.index].active = tab.active = false;
      }
    }
    this._activeId = info.tabId;
    // TODO: Add ability to configure this behaviour
    const window = await chrome.windows.get(info.windowId);
    if (window.focused) {
      const tab = this.get(info.tabId) as Tab;
      if (tab) {
        await this.updateIndecies();
        this.log("Tab:");
        this.log(tab);
        this.log("_tabs[tab.index]:");
        this.log(this._tabs[tab.index]);
        this._tabs[tab.index].active = tab.active = true;
      }
    }
  }

  private mainListener() {
    for (const [k, ids] of this._hostToIds.entries()) {
      if (!ids.length) {
        this.log("Deleting ", k);
        this._hostToIds.delete(k);
      }
    }
  }

  public discard(oldId: number, newId: number) {
    // TODO: Refactor?..
    const tab = this._idToTab.get(oldId)!;
    this._idToTab.delete(oldId);
    this._idToTab.set(newId, tab);
    __maps__.updateMap("urlToIds", tab.url, oldId);
    __maps__.updateMap("urlToIds", tab.url, newId);
    if (tab.urlObj?.host)
      __maps__.updateMap("hostToIds", tab.urlObj?.host, oldId);
    if (tab.urlObj?.host)
      __maps__.updateMap("hostToIds", tab.urlObj?.host, newId);
  }

  constructor() {
    __maps__.registerMap<number, Tab>("idToTab", this._idToTab);
    __maps__.registerMap<number, Tab>("idxToTab", this._idxToTab);
    __maps__.registerMap<string, number[]>("urlToIds", this._urlToIds);
    __maps__.registerMap<string, Iterable<number>>(
      "hostToIds",
      this._hostToIds,
    );

    __maps__.registerUpdater<Map<number, Tab>, number, Tab>(
      "idToTab",
      simpleOneToOneMapUpdater,
    );

    __maps__.registerUpdater<Map<number, Tab>, number, Tab>(
      "idxToTab",
      simpleOneToOneMapUpdater,
    );

    __maps__.registerUpdater<Map<string, number[]>, string, number>(
      "urlToIds",
      stringToIdsMapUpdater,
    );

    __maps__.registerUpdater<TabsMapOneToMany<string, number>, string, number>(
      "hostToIds",
      stringToIdsMapUpdater,
    );

    const tabs = Browser.getTabs();

    tabs.onActivated.addListener(this.activatedListener.bind(this));
    tabs.onUpdated.addListener(this.mainListener.bind(this));
    tabs.onRemoved.addListener(this.mainListener.bind(this));
    tabs.onCreated.addListener(this.createListener.bind(this));
    tabs.onUpdated.addListener(this.updateListener.bind(this));
    tabs.onRemoved.addListener(this.removeListener.bind(this));
    tabs.onMoved.addListener(this.movedListener.bind(this));

    tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
      this._tabs = tabs.map((t: chrome.tabs.Tab) => new Tab(t));
      this._tabs.forEach((tab: Tab) => {
        if (tab.active) {
          this._activeId = tab.id;
        }
        this._idToTab.set(tab.id!, tab);
        const url = (tab.url || tab.pendingUrl)!;
        const host = new URL(url).host;
        if (host) {
          __maps__.updateMap("hostToIds", host, tab.id!);
        }
        __maps__.updateMap("urlToIds", url, tab.id!);
        __maps__.updateMap("idxToTab", tab.index, tab);
      });
    });
    Object.assign(this, {
      [Symbol.toStringTag]: `Tabs`,
    });
  }

  get tabs(): Tab[] {
    const _tabs = [];
    for (const [i, t] of this._idxToTab.entries()) {
      _tabs[i] = t;
    }
    return _tabs;
  }

  get last(): Tab {
    return this._idxToTab.get(this._tabs.length - 1)!;
  }

  get first(): Tab {
    return this._idxToTab.get(0)!;
  }

  get activeId(): number {
    if (this._activeId) {
      return this._activeId;
    }
    return 0;
  }
}
