import { getTabs } from "./env";
import { Tab } from "./tab";
import { TabMaps } from "./tab-maps";
import { ITabMaps, TabsMapOneToMany } from "./types";
import { ensureClosingSlash } from "./utils";

export class Tabs {
  private __debug__ = false;
  private static __mapNames__ = new Set<string>([
    "idToTab",
    "urlToId",
    "hostToTab",
  ]);

  private __maps__: ITabMaps = new TabMaps();

  private _urlToId = new Map<string, number>();
  private _idToTab = new Map<number, Tab>();
  protected _tabs: Tab[] = [];

  private _hostToIds = new Map<string, number[]>();

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

  private createListener = (tab: chrome.tabs.Tab) => {
    this.log("Created!");
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

    const host = wrappedTab.urlObj.host;
    if (host) {
      this.__maps__.updateMap("hostToIds", host, wrappedTab.id!);
    }
  };

  private updateListener = (
    id: number,
    changeInfo: chrome.tabs.TabChangeInfo,
  ) => {
    this.log("Updated!");
    if (!this.hasId(id)) {
      console.warn(id);
      throw Error("Failed to find updated tab by id!");
    }
    const _tab = this.getTabById(id)!;
    if ("url" in changeInfo || "pendingUrl" in changeInfo) {
      const url = (_tab.url || _tab.pendingUrl)!;

      const oldHost = _tab.urlObj.host;
      const newHost = new URL(changeInfo.url ?? "").host;

      if (newHost && newHost !== oldHost) {
        this.__maps__.updateMap("hostToIds", oldHost, _tab.id!);
        this.__maps__.updateMap("hostToIds", newHost, _tab.id!);
      }

      this._urlToId.delete(url);
    }

    Object.assign(_tab, changeInfo);

    if (this._assertTabUrl(_tab)) {
      const url: string = (_tab.url || _tab.pendingUrl)!;
      this._urlToId.set(url, id);
    }
  };

  private removeListener = (id: number) => {
    this.log("Removed!");
    const oldTab = this.getTabById(id)!;

    const host = oldTab?.urlObj.host;
    if (this._hostToIds.has(host)) {
      this.__maps__.updateMap("hostToIds", host, id);
    }

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

  private mainListener() {
    for (const [k, ids] of this._hostToIds.entries()) {
      if (!ids.length) {
        this.log("Deleting ", k);
        this._hostToIds.delete(k);
      }
    }
  }

  constructor() {
    this.__maps__.registerMap<number, Tab>("idToTab", this._idToTab);
    this.__maps__.registerMap<string, number>("urlToId", this._urlToId);
    this.__maps__.registerMap<string, Iterable<number>>(
      "hostToIds",
      this._hostToIds,
    );

    this.__maps__.registerUpdater<Map<number, Tab>, number, Tab>(
      "idToTab",
      (map, key, value) => {
        if (!value) {
          map.delete(key);
          return;
        }
        //TODO: Add Extra validations
        map.set(key, value);
      },
    );

    this.__maps__.registerUpdater<Map<string, number>, string, number>(
      "urlToId",
      (map, key, value) => {
        if (!value) {
          map.delete(key);
          return;
        }
        //TODO: Add Extra validations
        map.set(key, value);
      },
    );

    this.__maps__.registerUpdater<
      TabsMapOneToMany<string, number>,
      string,
      number
    >("hostToIds", (map, key, value) => {
      console.log(map, key, value);
      if (!value) {
        console.warn("Invalid id", value);
        return;
      }

      if (!map.has(key)) {
        map.set(key, [value]);
        return;
      }

      const ids = map.get(key)!;

      if (ids.includes(value)) {
        const newIds = ids.filter((i: number) => i !== value);
        if (!newIds.length) {
          map.delete(key);
          return;
        }
        map.set(key, newIds);
        return;
      }
      const newIds = [...ids, value];
      map.set(key, newIds);
    });

    const tabs = getTabs();

    tabs.onUpdated.addListener(this.mainListener.bind(this));
    tabs.onRemoved.addListener(this.mainListener.bind(this));
    tabs.onCreated.addListener(this.createListener.bind(this));
    tabs.onUpdated.addListener(this.updateListener.bind(this));
    tabs.onRemoved.addListener(this.removeListener.bind(this));

    tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
      this._tabs = tabs.map((t: chrome.tabs.Tab) => new Tab(t));
      this._tabs.forEach((tab: Tab) => {
        this._idToTab.set(tab.id!, tab);
        const url = (tab.url || tab.pendingUrl)!;
        const host = new URL(url).host;
        if (host) {
          this.__maps__.updateMap("hostToIds", host, tab.id!);
        }
        this.__maps__.updateMap("urlToId", url, tab.id!);
      });
    });
    Object.assign(this, {
      [Symbol.toStringTag]: `Tabs`,
    });
  }

  get tabs(): Tab[] {
    return this._tabs;
  }
}
