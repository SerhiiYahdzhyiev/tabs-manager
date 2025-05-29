import { Browser } from "../api";
import { ITabMaps, IVersionable, IListeners } from "../interfaces";
import { manipulations } from "../manipulations/index";
import { ManipulationName } from "../manipulations/names";
import { MapName } from "../maps/map-names";
import { getMaps } from "../maps/get-maps";
import { urlKeys } from "../maps/url-keys";
import { Listeners } from "../listeners/base";
import { Tab } from "../tab";
import { sleep } from "../utils/process";
import { debug } from "../utils/logging";

import { connect } from "./connect";
import { create } from "./create";
import { discard } from "./discard";
import { remove } from "./remove";
import { url } from "../utils/url";

export class TabsManager implements IVersionable {
  // TODO: Realize version insertion from build system
  //       in a format of a hex digit.
  private static _activeId: number = 0;
  private static __version__ = "0.2.0";
  private _name: string = "manager";
  private _tabs: Tab[] = [];
  private _maps: ITabMaps = getMaps();
  private _listeners: IListeners = new Listeners();
  private __initialized__ = false;

  private _initTabs() {
    const tabs = Browser.getTabs();

    tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
      this._tabs = tabs.map((t: chrome.tabs.Tab) => new Tab(t));
      this._tabs.forEach((tab: Tab) => {
        if (tab.active) {
          TabsManager._activeId = tab.id;
        }
        this._maps.updateMap(MapName.ID_2_TAB, tab.id!, tab);
        this._maps.updateMap(MapName.IDX_2_TAB, tab.index, tab);
        const url = (tab.url || tab.pendingUrl)!;
        this._maps.updateMap(MapName.URL_2_IDS, url, tab.id!);
        this._updateUrlMaps(tab);
        this.__initialized__ = true;
      });
    });
  }

  private async _activate(info: chrome.tabs.TabActiveInfo) {
    const activeId = TabsManager._activeId;
    this.debug("Updating active tab...");

    this.debug("Current activateId: " + activeId);
    this.debug("Tab Active info: ");
    this.debug(info);

    if (activeId && activeId !== info.tabId) {
      const tab = this._maps.getValue<number, Tab>("idToTab", activeId);
      if (tab) {
        this.debug("Tab:");
        this.debug(tab);
        this.debug("this._tabs[tab.index]:");
        this.debug(this._tabs[tab.index]);
        this._tabs[tab.index].active = tab.active = false;
      }
    }
    TabsManager._activeId = info.tabId;
    // TODO: Add ability to configure this behaviour
    const window = await chrome.windows.get(info.windowId);
    if (window.focused) {
      const tab = this._maps.getValue<number, Tab>("idToTab", info.tabId);
      if (tab) {
        this.debug("Tab:");
        this.debug(tab);
        this.debug("this._tabs[tab.index]:");
        this.debug(this._tabs[tab.index]);
        this._tabs[tab.index].active = tab.active = true;
      }
    }
  }

  private async _indexUpdate() {
    this.debug("Updating indecies...");
    // INFO: Probably rebuilding the entire map is not the efficient way,
    //       but I've struggled to write it differently without introducing
    //       internal structures' consistency bugs...
    // TODO: Try to write more efficient updating algorithm...
    this._maps.clearMap(MapName.IDX_2_TAB);
    for (const tab of this._tabs) {
      const internalIdx = tab.index;
      this.debug("Internal index: " + internalIdx);
      const realIdx = (await Browser.getTabs().get(tab.id)).index;
      this.debug("Real index: " + realIdx);
      tab.index = realIdx;
      this._maps.updateMap(MapName.IDX_2_TAB, realIdx, tab);
    }
  }

  private _updateUrlMaps(tab: Tab): void {
    for (const key of urlKeys) {
      const value = (tab as unknown as Record<MapName, string>)[key];
      if (value) this._maps.updateMap(key, value, tab.id);
    }
  }

  private async _create(tab: chrome.tabs.Tab) {
    this.debug("Created!");
    const wrappedTab = new Tab(tab);
    this._tabs = [...this._tabs, wrappedTab];
    this._maps.updateMap(MapName.ID_2_TAB, this._tabs.length - 1, wrappedTab);
    if (!wrappedTab.id) {
      console.warn("Skipping tab without id!");
      console.warn("This tab will not be saved in id->tab map!");
      console.dir(tab);
      return;
    }
    this._maps.updateMap(MapName.ID_2_TAB, tab.id!, wrappedTab);

    if (!wrappedTab.url && !wrappedTab.pendingUrl) {
      console.warn("Skipping tab without both url and pendingUrl!");
      console.warn("This tab will not be saved in url->tab map!");
      return;
    }

    const _url: string = (wrappedTab.url || wrappedTab.pendingUrl)!;
    this._maps.updateMap(MapName.URL_2_IDS, url(_url).href, wrappedTab.id);

    // TODO: Move it below index updation ?
    this._updateUrlMaps(wrappedTab);

    await this._indexUpdate();
  }

  private _clearUrlMaps() {
    // TODO: Test performance implications,
    //       think of more optimal way to do this
    for (const urlKey of urlKeys) {
      for (const [key, ids] of this._maps.entries<string, number[]>(urlKey)) {
        if (!ids.length) {
          this.debug("Deleting ", key);
          this._maps.updateMap(urlKey, key, null);
        }
      }
    }
  }

  private async _remove(id: number) {
    this.debug("Removed!");
    const oldTab = this._maps.getValue<number, Tab>(MapName.ID_2_TAB, id)!;

    this._updateUrlMaps(oldTab);

    this._tabs = this._tabs.filter((t) => t.id !== id);

    const _url = (oldTab.url || oldTab.pendingUrl)!;
    if (this._maps.hasKey(MapName.URL_2_IDS, url(_url).href)) {
      this._maps.updateMap(MapName.URL_2_IDS, url(_url).href, id);
    }
    this._maps.updateMap(MapName.ID_2_TAB, id, null);
    await this._indexUpdate();
  }

  private async _update(id: number, changeInfo: chrome.tabs.TabChangeInfo) {
    this.debug("Updated!");
    this.debug(id, changeInfo);

    const discarded =
      "discarded" in changeInfo && changeInfo.discarded === true;

    if (discarded) return;

    const urlChanged = "url" in changeInfo || "pendingUrl" in changeInfo;

    if (!this._maps.hasKey(MapName.ID_2_TAB, id)) {
      console.warn(id);
      throw Error("Failed to find updated tab by id!");
    }

    const tab = this._maps.getValue<number, Tab>(MapName.ID_2_TAB, id)!;

    if (urlChanged) {
      const _url: string = (tab.url || tab.pendingUrl)!;
      this.debug("url: ", _url);
      // INFO: Remove id from old url entry...
      this._maps.updateMap(MapName.URL_2_IDS, url(_url).href, tab.id);

      for (const key of urlKeys) {
        const oldValue = (tab as unknown as Record<MapName, string>)[key];
        const newUrl = new URL(changeInfo.url ?? "");
        const newValue = (newUrl as unknown as Record<MapName, string>)[key];

        if (newValue && newValue !== oldValue) {
          if (oldValue) this._maps.updateMap(key, oldValue, tab.id!);
          this._maps.updateMap(key, newValue, tab.id!);
        }
      }
    }

    Object.assign(tab, changeInfo);

    if (urlChanged && (tab.url || tab.pendingUrl)) {
      const _url: string = (tab.url || tab.pendingUrl)!;
      this.debug("url: ", _url);
      this._maps.updateMap(MapName.URL_2_IDS, url(_url).href, tab.id);
    }
  }

  private _initListeners() {
    this._listeners.register("activate", this._activate);
    this._listeners.register("create", this._create);
    this._listeners.register("clearUrlMaps", this._clearUrlMaps);
    this._listeners.register("move", this._indexUpdate);
    this._listeners.register("remove", this._remove);
    this._listeners.register("update", this._update);

    this._listeners.init();
  }

  public static get version(): string {
    return this.__version__;
  }

  private debug(...args: unknown[]) {
    const _args = [`[${String(this)}]: `, ...args];
    debug(..._args);
  }

  public async executeManipulation(
    name: ManipulationName,
    target: unknown,
    payload: unknown = null,
  ) {
    const manipulation = manipulations.get(name);
    if (!manipulation) {
      this.debug("No tab manipulation with name: " + name);
      return;
    }
    const args = manipulation.getArgsFrom(target, payload);
    return args instanceof Array
      ? await manipulation(...args)
      : await manipulation(args);
  }

  public executeManipulationSync(
    name: ManipulationName,
    target: unknown,
    payload: unknown = null,
  ) {
    const manipulation = manipulations.get(name);
    if (!manipulation) {
      this.debug("No tab manipulation with name: " + name);
      return;
    }
    const args = manipulation.getArgsFrom(target, payload);
    return args instanceof Array ? manipulation(...args) : manipulation(args);
  }

  get version(): string {
    return TabsManager.version;
  }

  constructor(options: Record<string, string>) {
    if (options?.name) {
      this._name = options.name;

      (this as { version: string }).version = TabsManager.version;
      Object.setPrototypeOf(this, TabsManager.prototype);
    }

    const browserTabs = Browser.getTabs();

    Object.assign(this, {
      create: create.bind(this),
      connect: connect.bind(this),
      //@ts-expect-error INFO: _maps is private
      discard: discard.bind(this),
      query: async (info: chrome.tabs.QueryInfo) => {
        const candidates = await browserTabs.query(info);
        if (candidates?.length) {
          for (let i = 0; i < candidates.length; i++) {
            // TODO: Find a way to do it with less TS uglyness...
            (candidates as unknown as Tab[])[i] = new Tab(candidates[i]);
          }
        }
        return candidates;
      },
      //@ts-expect-error INFO: _maps is private
      remove: remove.bind(this),
      //@ts-expect-error INFO: _maps is private
      close: remove.bind(this),
      reload: browserTabs.reload,
      update: async (tabId: number, props: chrome.tabs.UpdateProperties) => {
        const updated = await browserTabs.update(tabId, props);
        // TODO: Consider getting the same functionality done without using
        //       sleeps...
        await sleep(200);
        return this._get(updated.id!) as Tab;
      },
    });

    Object.assign(this, {
      [Symbol.toStringTag]: `${this._name}`,
    });

    this._activate = this._activate.bind(this);
    this._create = this._create.bind(this);
    this._clearUrlMaps = this._clearUrlMaps.bind(this);
    this._indexUpdate = this._indexUpdate.bind(this);
    this._remove = this._remove.bind(this);
    this._update = this._update.bind(this);
    this._updateUrlMaps = this._updateUrlMaps.bind(this);

    this._initListeners();

    this._initTabs();
  }

  public get active(): Tab | null {
    if (TabsManager._activeId) {
      return (
        this._maps.getValue<number, Tab>(
          MapName.ID_2_TAB,
          TabsManager._activeId,
        ) ?? null
      );
    }
    return null;
  }

  public getAll(): Tab[] {
    return this._tabs;
  }

  public get(key: string | number): Tab | Tab[] | null {
    return this._get(key);
  }

  public _get(key: string | number): Tab | Tab[] | null {
    if (typeof key === "number") {
      return this._maps.getValue(MapName.ID_2_TAB, key) ?? null;
    }
    if (typeof key === "string") {
      let candidate: Tab | Tab[] | null = null;
      if (!isNaN(+key) && +key > 0) {
        candidate = this._maps.getValue(MapName.ID_2_TAB, +key) ?? null;
      }
      if (!candidate) {
        candidate = this._getTabsByUrl(key);
      }
      return candidate;
    }
    return null;
  }

  public has(key: string | number): boolean {
    return this._has(key);
  }

  public _has(key: string | number): boolean {
    if (typeof key === "number") {
      return this._maps.hasKey(MapName.ID_2_TAB, key);
    }
    if (typeof key === "string") {
      let a: boolean = false;
      if (!isNaN(+key) && +key > 0) {
        a = this._maps.hasKey(MapName.ID_2_TAB, +key);
      }
      const b = this._hasUrl(key);
      return a || b;
    }
    return false;
  }

  private _hasUrl(url: string) {
    try {
      new URL(url);
    } catch {
      console.warn("Invalid url: " + url);
      return false;
    }
    return this._maps.hasKey(MapName.URL_2_IDS, url);
  }

  public focus(tab: Tab): void {
    // TODO: Accept plain tab and wrap it here?
    tab.focus();
  }

  private _getTabsByUrl(url: string): Tab[] {
    try {
      new URL(url);
    } catch {
      console.warn("Invalid url: " + url);
      return [];
    }
    const ids = this._maps.getValue<string, number[]>(MapName.URL_2_IDS, url);
    if (ids && ids.length) {
      const result: Tab[] = [];
      for (const id of ids) {
        result.push(this._maps.getValue(MapName.ID_2_TAB, id)!);
      }
      return result;
    }
    return [];
  }

  public get tabs(): Tab[] {
    // INFO: Temporary realization, will be changed to respect filters...
    const _tabs = [];
    for (const [i, t] of this._maps.entries<number, Tab>(MapName.IDX_2_TAB)) {
      _tabs[i] = t;
    }
    return _tabs;
  }

  public get last(): Tab {
    return this._maps.getValue<number, Tab>(
      MapName.IDX_2_TAB,
      this._tabs.length - 1,
    )!;
  }

  public get first(): Tab {
    return this._maps.getValue<number, Tab>(MapName.IDX_2_TAB, 0)!;
  }
}
