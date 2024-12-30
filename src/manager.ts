import { ITabMaps, IVersionable } from "./interfaces";
import { Browser } from "./api";
import { discard } from "./discard";

import { Tab } from "./tab";

import { sleep } from "./utils/process";

declare const __maps__: ITabMaps;
declare let __tabs__: Tab[];
declare let _activeId: number;

export class TabsManager implements IVersionable {
  // TODO: Realize version insertion from build system
  //       in a format of a hex digit.
  private static __version__ = "0.2.0";

  public static get version(): string {
    return this.__version__;
  }

  get version(): string {
    return TabsManager.version;
  }

  private _name: string = "default";

  constructor(options: Record<string, string>) {
    if (options?.name) {
      this._name = options.name;

      (this as { version: string }).version = TabsManager.version;
      Object.setPrototypeOf(this, TabsManager.prototype);
    }

    const browserTabs = Browser.getTabs();

    Object.assign(this, {
      create: async (props: chrome.tabs.CreateProperties = {}) => {
        await browserTabs.create(props);
        await sleep(200);
        return __tabs__[__tabs__.length - 1];
      },
      connect: browserTabs.connect,
      // TODO: Refactor?..
      discard: async (tabId: number) => {
        const tab = await browserTabs.discard(tabId);
        const oldTab = __maps__.getValue("idToTab", tabId)!;
        discard(tabId, tab?.id || tabId);
        Object.assign(oldTab, tab || { discarded: true });
        return oldTab;
      },
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
      remove: browserTabs.remove,
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
      [Symbol.toStringTag]: `TabsManager ${this._name}`,
    });
  }

  public static withTabs<ReturnType>(
    cb: <TArgs>(tabs: Tab[], ...args: TArgs[]) => ReturnType,
  ): <TArgs>(...args: TArgs[]) => ReturnType {
    return <TArgs>(...args: TArgs[]) => {
      return cb(__tabs__, ...args);
    };
  }

  public get active(): Tab | null {
    if (_activeId) {
      return __maps__.getValue<number, Tab>("idToTab", _activeId) ?? null;
    }
    return null;
  }

  public getAll(): Tab[] {
    return __tabs__;
  }

  public get(key: string | number): Tab | Tab[] | null {
    return this._get(key);
  }

  public _get(key: string | number): Tab | Tab[] | null {
    if (typeof key === "number") {
      return __maps__.getValue("idToTab", key) ?? null;
    }
    if (typeof key === "string") {
      let candidate: Tab | Tab[] | null = null;
      if (!isNaN(+key) && +key > 0) {
        candidate = __maps__.getValue("idToTab", +key) ?? null;
      }
      if (!candidate) {
        candidate = this._getTabsByUrl(key);
      }
      return candidate;
    }
    return null;
  }

  private _getTabsByUrl(url: string): Tab[] {
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
        result.push(__maps__.getValue("idToTab", id)!);
      }
      return result;
    }
    return [];
  }

  public has(key: string | number): boolean {
    return this._has(key);
  }

  private _hasUrl(url: string) {
    try {
      new URL(url);
    } catch {
      console.warn("Invalid url: " + url);
      return false;
    }
    return __maps__.hasKey("urlToIds", url);
  }

  public _has(key: string | number): boolean {
    if (typeof key === "number") {
      return __maps__.hasKey("idToTab", key);
    }
    if (typeof key === "string") {
      let a: boolean = false;
      if (!isNaN(+key) && +key > 0) {
        a = __maps__.hasKey("idToTab", +key);
      }
      const b = this._hasUrl(key);
      return a || b;
    }
    return false;
  }

  public focus(tab: Tab): void {
    // TODO: Accept plain tab and wrap it here?
    tab.focus();
  }

  public get tabs(): Tab[] {
    // INFO: Temporary realization, will be changed to respect filters...
    const _tabs = [];
    for (const [i, t] of __maps__.entries<number, Tab>("idxToTab")) {
      _tabs[i] = t;
    }
    return _tabs;
  }

  public get last(): Tab {
    // WARN: This is temporary solution
    // TODO: Replace with first element of fileterd tabs list of current
    //       manager.
    return __maps__.getValue<number, Tab>("idxToTab", __tabs__.length - 1)!;
  }

  public get first(): Tab {
    // WARN: This is temporary solution
    // TODO: Replace with first element of fileterd tabs list of current
    //       manager.
    return __maps__.getValue<number, Tab>("idxToTab", 0)!;
  }
}
