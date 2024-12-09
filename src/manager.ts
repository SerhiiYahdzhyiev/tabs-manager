import { IVersionable } from "./interfaces";
import { Browser } from "./api";

import { Tabs } from "./tabs";
import { Tab } from "./tab";

import { sleep } from "./utils";

declare let _tabs: Tabs;

/**
 * A class to manage browser tabs, providing operations for creating, querying, updating, and managing tabs.
 * Implements the `IVersionable` interface.
 */
export class TabsManager implements IVersionable {
  /**
   * The current version of the TabsManager, injected during the build process.
   * @private
   */
  private static __version__ = "0.1.0";

  /**
   * Retrieves the static version of the TabsManager.
   * @returns {string} The version string.
   */
  public static get version(): string {
    return this.__version__;
  }

  /**
   * Retrieves the instance version of the TabsManager.
   * @returns {string} The version string.
   */
  get version(): string {
    return TabsManager.version;
  }

  /**
   * The name of the current TabsManager instance.
   * @private
   */
  private _name: string = "default";

  /**
   * Constructs a TabsManager instance.
   *
   * @param {Record<string, string>} options - Configuration options for the TabsManager.
   * @param {string} [options.name] - A custom name for the TabsManager instance.
   */
  constructor(options: Record<string, string>) {
    if (options?.name) {
      this._name = options.name;
      (this as { version: string }).version = TabsManager.version;
      Object.setPrototypeOf(this, TabsManager.prototype);
    }

    const browserTabs = Browser.getTabs();

    // Assign dynamic methods to the instance
    Object.assign(this, {
      /**
       * Creates a new browser tab.
       * @param {chrome.tabs.CreateProperties} props - Tab creation properties.
       * Can be omitted. Defaults to {}.
       * @returns {Promise<Tab>} The created tab.
       */
      create: async (props: chrome.tabs.CreateProperties = {}) => {
        await browserTabs.create(props);
        await sleep(200);
        return _tabs.tabs[_tabs.tabs.length - 1];
      },

      /**
       * Connects to a tab.
       */
      connect: browserTabs.connect,

      /**
       * Discards a tab by its ID.
       * @param {number} tabId - The ID of the tab to discard.
       * @returns {Promise<Tab>} The discarded tab.
       */
      discard: async (tabId: number) => {
        const tab = await browserTabs.discard(tabId);
        const oldTab = _tabs.getTabById(tabId)!;
        _tabs.discard(tabId, tab.id!);
        Object.assign(oldTab, tab);
        return oldTab;
      },

      /**
       * Queries for browser tabs matching the specified criteria.
       * @param {chrome.tabs.QueryInfo} info - Query parameters.
       * @returns {Promise<Tab[]>} The list of matching tabs.
       */
      query: async (info: chrome.tabs.QueryInfo) => {
        const candidates = await browserTabs.query(info);
        if (candidates?.length) {
          for (let i = 0; i < candidates.length; i++) {
            (candidates as unknown as Tab[])[i] = new Tab(candidates[i]);
          }
        }
        return candidates;
      },

      remove: browserTabs.remove,
      reload: browserTabs.reload,

      /**
       * Updates a tab with new properties.
       * @param {number} tabId - The ID of the tab to update.
       * @param {chrome.tabs.UpdateProperties} props - Update properties.
       * @returns {Promise<Tab>} The updated tab.
       */
      update: async (tabId: number, props: chrome.tabs.UpdateProperties) => {
        const updated = await browserTabs.update(tabId, props);
        await sleep(200);
        return _tabs.get(updated.id!) as Tab;
      },
    });

    Object.assign(this, {
      [Symbol.toStringTag]: `TabsManager ${this._name}`,
    });
  }

  /**
   * Executes a callback with the current list of tabs.
   *
   * @template ReturnType
   * @param {function} cb - The callback to execute, which receives the tabs and additional arguments.
   * @returns {function} A function that accepts additional arguments and returns the result of the callback.
   */
  public static withTabs<ReturnType>(
    cb: <TArgs>(tabs: Tab[], ...args: TArgs[]) => ReturnType,
  ): <TArgs>(...args: TArgs[]) => ReturnType {
    return <TArgs>(...args: TArgs[]) => {
      return cb(_tabs.tabs, ...args);
    };
  }

  /**
   * Retrieves the currently active tab.
   * @returns {Tab | null} The active tab or `null` if none is active.
   */
  public getActive(): Tab | null {
    if (_tabs.activeId) {
      return _tabs.get(_tabs.activeId) as Tab;
    }
    return null;
  }

  /**
   * Retrieves all tabs managed by the TabsManager.
   * @returns {Tab[]} The list of all tabs.
   */
  public getAll(): Tab[] {
    return _tabs.tabs;
  }

  /**
   * Retrieves a tab or tabs by their key.
   * @param {string | number} key - The key of the tab(s) to retrieve.
   * @returns {Tab | Tab[] | null} The tab(s) or `null` if not found.
   */
  public get(key: string | number): Tab | Tab[] | null {
    return _tabs.get(key);
  }

  /**
   * Checks if a tab with the specified key exists.
   * @param {string | number} key - The key to check.
   * @returns {boolean} `true` if the tab exists, otherwise `false`.
   */
  public has(key: string | number): boolean {
    return _tabs.has(key);
  }

  /**
   * Focuses the specified tab.
   * @param {Tab} tab - The tab to focus.
   */
  public focus(tab: Tab): void {
    // TODO: Accept plain tab and wrap it here?
    tab.focus();
  }

  /**
   * Retrieves the list of tabs managed by the TabsManager.
   * @returns {Tab[]} The list of tabs.
   */
  public get tabs(): Tab[] {
    return _tabs.tabs;
  }

  /**
   * Retrieves the first tab.
   * @returns {Tab} The first tab.
   * @warning This is a temporary implementation; subject to change.
   */
  public get first(): Tab {
    return _tabs.first;
  }

  /**
   * Retrieves the last tab.
   * @returns {Tab} The last tab.
   * @warning This is a temporary implementation; subject to change.
   */
  public get last(): Tab {
    return _tabs.last;
  }
}
