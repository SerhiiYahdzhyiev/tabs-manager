import { Browser } from "./api";

import { Tab } from "./tab";

import { ITabMaps } from "./interfaces";

declare const __maps__: ITabMaps;
declare let __tabs__: Tab[];
declare let _activeId: number;

export class Tabs {
  private _activeId = 0;

  public getTabById(id: number): Tab | null {
    return __maps__.getValue("idToTab", id) || null;
  }

  public getTabsByUrl(url: string): Tab[] {
    try {
      new URL(url);
    } catch {
      console.warn("Invalid url: " + url);
      return [];
    }
    const ids = __maps__.getValue<string, number[]>("urlToIds", url);
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
    return __maps__.getValue("urlToIds", url) || [];
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
    return __maps__.hasKey("idToTab", id);
  }

  public hasUrl(url: string) {
    try {
      new URL(url);
    } catch {
      console.warn("Invalid url: " + url);
      return false;
    }
    return __maps__.hasKey("urlToIds", url);
  }

  public has(key: string | number): boolean {
    if (typeof key === "number") {
      return __maps__.hasKey("idToTab", key);
    }
    if (typeof key === "string") {
      let a: boolean = false;
      if (!isNaN(+key) && +key > 0) {
        a = __maps__.hasKey("idToTab", +key);
      }
      const b = this.hasUrl(key);
      return a || b;
    }
    return false;
  }

  public discard(oldId: number, newId: number) {
    // TODO: Refactor?..
    const tab = __maps__.getValue<number, Tab>("idToTab", oldId)!;
    __maps__.updateMap("idToTab", oldId, null);
    __maps__.updateMap("idToTab", newId, tab);
    __maps__.updateMap("urlToIds", tab.url, oldId);
    __maps__.updateMap("urlToIds", tab.url, newId);
    if (tab.urlObj?.host)
      __maps__.updateMap("hostToIds", tab.urlObj?.host, oldId);
    if (tab.urlObj?.host)
      __maps__.updateMap("hostToIds", tab.urlObj?.host, newId);
  }

  constructor() {
    const tabs = Browser.getTabs();

    tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
      __tabs__ = tabs.map((t: chrome.tabs.Tab) => new Tab(t));
      __tabs__.forEach((tab: Tab) => {
        if (tab.active) {
          this._activeId = _activeId = tab.id;
        }
        __maps__.updateMap("idToTab", tab.id!, tab);
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
    for (const [i, t] of __maps__.entries<number, Tab>("idxToTab")) {
      _tabs[i] = t;
    }
    return _tabs;
  }

  get last(): Tab {
    return __maps__.getValue<number, Tab>("idxToTab", __tabs__.length - 1)!;
  }

  get first(): Tab {
    return __maps__.getValue<number, Tab>("idxToTab", 0)!;
  }

  get activeId(): number {
    if (this._activeId) {
      return this._activeId;
    }
    return 0;
  }
}
