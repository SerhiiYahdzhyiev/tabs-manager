import { Browser } from "./api";
import { Tabs } from "./tabs";
import { withError } from "./utils";

import clearAllInputs from "./scripts/clearAllInputs";

declare let _tabs: Tabs;

/**
 * Represents a single browser tab, providing methods to interact with it.
 */
export class Tab {
  /** Indicates if the tab is active. */
  active: boolean = false;

  /** The ID of the tab. */
  id: number = -1;

  /** The index of the tab within its window. */
  index: number = -1;

  /** The ID of the window containing the tab. */
  windowId: number = -1;

  /** The current URL of the tab. */
  url: string = "";

  /** The pending URL of the tab (if applicable). */
  pendingUrl: string = "";

  /** The timestamp when the tab was created. */
  createdAt: number;

  /** The timestamp of the last access to the tab. */
  lastAccessed: number = Date.now();

  /** Indicates if the tab has been removed. */
  private _removed = false;

  /** Callable methods for various tab operations. */
  connect: CallableFunction;
  clearAllInputs: CallableFunction;
  discard: CallableFunction;
  duplicate: CallableFunction;
  getLanguage: CallableFunction;
  getScreenshot: CallableFunction;
  goBack: CallableFunction;
  goForward: CallableFunction;
  move: CallableFunction;
  reload: CallableFunction;
  remove: CallableFunction;
  update: CallableFunction;

  /**
   * Wraps a method to ensure it cannot be called on a removed tab.
   * @param {CallableFunction} cb - The method to wrap.
   * @returns {CallableFunction} The wrapped method.
   * @private
   */
  private _withRemoved(cb: CallableFunction): CallableFunction {
    return (...args: unknown[]) => {
      if (this._removed) {
        console.warn("Cannot use operation on closed tab!");
        return;
      }
      return cb(...args);
    };
  }

  /**
   * Initializes a Tab instance based on a Chrome tab object.
   * @param {chrome.tabs.Tab} tab - The Chrome tab object.
   */
  constructor(tab: chrome.tabs.Tab) {
    Object.assign(this, tab);
    Object.assign(this, {
      [Symbol.toStringTag]: `Tab.${this.urlObj?.host || "broken"}`,
    });

    this.createdAt = Date.now();

    this.connect = this._withRemoved(this._connect.bind(this));
    this.clearAllInputs = this._withRemoved(
      withError(this._clearAllInputs.bind(this)),
    );
    this.discard = this._withRemoved(withError(this._discard.bind(this)));
    this.duplicate = this._withRemoved(withError(this._duplicate.bind(this)));
    this.goBack = this._withRemoved(withError(this._goBack.bind(this)));
    this.goForward = this._withRemoved(withError(this._goForward.bind(this)));
    this.getLanguage = this._withRemoved(withError(this._language.bind(this)));
    this.getScreenshot = this._withRemoved(
      withError(this._screenshot.bind(this)),
    );
    this.move = this._withRemoved(withError(this._move.bind(this)));
    this.reload = this._withRemoved(withError(this._reload.bind(this)));
    this.remove = this._withRemoved(withError(this._remove.bind(this)));
    this.update = this._withRemoved(withError(this._update.bind(this)));

    this.focus = this._withRemoved(
      withError(this.focus.bind(this)),
    ) as () => Promise<void>;
    this.forceClose = this._withRemoved(
      withError(this.forceClose.bind(this)),
    ) as () => Promise<void>;
  }

  /**
   * Discards the tab to free resources.
   * @returns {Promise<Tab>} The updated Tab instance.
   * @private
   */
  private async _discard(): Promise<Tab> {
    const rawTab = await Browser.getTabs().discard(this.id);
    _tabs.discard(this.id, rawTab.id!);
    Object.assign(this, rawTab);
    return this;
  }

  /**
   * Focuses the tab.
   * @returns {Promise<void>} Resolves when the operation completes.
   */
  public async focus(): Promise<void> {
    // TODO: Consider making this behaviour configurable...
    await Browser.getWindows()?.update(this.windowId, {
      state: "normal",
      focused: true,
    });
    await this._update({ active: true });
  }

  /**
   * Takes a screenshot of the visible part of the tab.
   * @param {chrome.tabs.CaptureVisibleTabOptions} options - Screenshot options.
   * @returns {Promise<string>} The base64-encoded image string.
   * @private
   */
  private async _screenshot(options: chrome.tabs.CaptureVisibleTabOptions) {
    await this.focus();
    return await Browser.getTabs().captureVisibleTab(this.windowId, options);
  }

  /**
   * Moves the tab to a new position.
   * @param {chrome.tabs.MoveProperties} options - Movement options.
   * @returns {Promise<Tab>} The updated Tab instance.
   * @private
   */
  private async _move(options: chrome.tabs.MoveProperties): Promise<Tab> {
    const moved = await Browser.getTabs().move(this.id, options);
    Object.assign(this, moved);
    return this;
  }

  /**
   * Reloads the tab.
   * @param {chrome.tabs.ReloadProperties} options - Reload options.
   * @returns {Promise<void>} Resolves when the operation completes.
   * @private
   */
  private async _reload(options: chrome.tabs.ReloadProperties): Promise<void> {
    await Browser.getTabs().reload(this.id, options);
  }

  /**
   * Navigates the tab forward in history.
   * @returns {Promise<void>} Resolves when the operation completes.
   * @private
   */
  private async _goForward(): Promise<void> {
    await Browser.getTabs().goForward(this.id);
  }

  /**
   * Navigates the tab backward in history.
   * @returns {Promise<void>} Resolves when the operation completes.
   * @private
   */
  private async _goBack(): Promise<void> {
    await Browser.getTabs().goBack(this.id);
  }

  /**
   * Duplicates the tab.
   * @returns {Promise<void>} Resolves when the operation completes.
   * @private
   */
  private async _duplicate(): Promise<void> {
    // TODO: Figure out how to handle returned tab here...
    await Browser.getTabs().duplicate(this.id);
  }

  /**
   * Detects the language of the tab's content.
   * @returns {Promise<string>} The detected language.
   * @private
   */
  private async _language(): Promise<string> {
    return await Browser.getTabs().detectLanguage(this.id);
  }

  /**
   * Connects to the tab.
   * @param {chrome.tabs.ConnectInfo} options - Connection options.
   * @returns {chrome.runtime.Port} The connection port.
   * @private
   */
  private _connect(options: chrome.tabs.ConnectInfo): chrome.runtime.Port {
    return Browser.getTabs().connect(this.id, options);
  }

  /**
   * Closes the tab and marks it as removed.
   * @returns {Promise<void>} Resolves when the operation completes.
   * @private
   */
  private async _remove(): Promise<void> {
    this._removed = true;
    await Browser.getTabs().remove(this.id);
  }

  /**
   * Updates the tab with new properties.
   * @param {chrome.tabs.UpdateProperties} options - Update options.
   * @returns {Promise<Tab>} The updated Tab instance.
   * @private
   */
  private async _update(options: chrome.tabs.UpdateProperties): Promise<Tab> {
    await Browser.getTabs().update(this.id, options);
    Object.assign(this, options);
    return this;
  }

  /**
   * Clears all input fields within the tab.
   * @returns {Promise<void>} Resolves when the operation completes.
   * @private
   */
  private async _clearAllInputs(): Promise<void> {
    const scripting = Browser.getScripting();
    if (!scripting)
      throw new Error("Scripting is not permitted or/and available!");

    await scripting.executeScript({
      target: { tabId: this.id },
      func: clearAllInputs,
    });
  }

  /**
   * Forcibly closes the tab using the debugger API.
   * @returns {Promise<void>} Resolves when the operation completes.
   */
  public async forceClose(): Promise<void> {
    const deb = Browser.getDebugger();
    if (!deb) throw new Error("Debugger is not permitted or/and available!");

    try {
      await deb.attach({ tabId: this.id }, "1.3");
    } catch (e) {
      console.warn(e);
    }
    await deb.sendCommand({ tabId: this.id }, "Page.navigate", {
      url: "about:blank",
    });
    await deb.detach({ tabId: this.id });
    await this.remove();
  }

  /**
   * Gets a `URL` object for the tab's URL.
   * @returns {URL | null} A `URL` object if the URL is valid, otherwise `null`.
   */
  get urlObj(): URL | null {
    const url = this.url || this.pendingUrl;
    if (!url) return null;
    return new URL(url);
  }

  /**
   * Gets the host of the tab's URL.
   * @returns {string} The host of the URL, or an empty string if unavailable.
   */
  get host(): string {
    return this.urlObj?.host || "";
  }

  /**
   * Gets the hostname of the tab's URL.
   * @returns {string} The hostname of the URL, or an empty string if unavailable.
   */
  get hostname(): string {
    return this.urlObj?.hostname || "";
  }

  /**
   * Gets the origin of the tab's URL.
   * @returns {string} The origin of the URL, or an empty string if unavailable.
   */
  get origin(): string {
    return this.urlObj?.origin || "";
  }

  /**
   * Gets the full URL string of the tab.
   * @returns {string} The full URL, or an empty string if unavailable.
   */
  get href(): string {
    return this.urlObj?.href || "";
  }

  /**
   * Gets the protocol of the tab's URL.
   * @returns {string} The protocol of the URL, or an empty string if unavailable.
   */
  get protocol(): string {
    return this.urlObj?.protocol || "";
  }

  /**
   * Gets the username portion of the tab's URL, if present.
   * @returns {string} The username, or an empty string if unavailable.
   */
  get username(): string {
    return this.urlObj?.username || "";
  }

  /**
   * Gets the hash portion of the tab's URL, if present.
   * @returns {string} The hash value, or an empty string if unavailable.
   */
  get hash(): string {
    return this.urlObj?.hash || "";
  }

  /**
   * Gets the password portion of the tab's URL, if present.
   * @returns {string} The password, or an empty string if unavailable.
   */
  get password(): string {
    return this.urlObj?.password || "";
  }

  /**
   * Gets the path portion of the tab's URL.
   * @returns {string} The pathname, or an empty string if unavailable.
   */
  get pathname(): string {
    return this.urlObj?.pathname || "";
  }

  /**
   * Gets the query string of the tab's URL.
   * @returns {string} The search string, or an empty string if unavailable.
   */
  get search(): string {
    return this.urlObj?.search || "";
  }

  /**
   * Gets the search parameters of the tab's URL as a `URLSearchParams` object.
   * @returns {URLSearchParams | null} The search parameters, or `null` if unavailable.
   */
  get searchParams(): URLSearchParams | null {
    return this.urlObj?.searchParams || null;
  }

  /**
   * Gets the port of the tab's URL.
   * @returns {number} The port number, or a default value based on the protocol if unspecified.
   */
  get port(): number {
    const candidate = parseInt(this.urlObj?.port || "");
    if (candidate) return candidate;
    if (this.protocol.includes("https")) return 443;
    if (this.protocol.includes("http")) return 80;
    if (this.protocol.includes("ftp")) return 21;
    if (this.protocol.includes("sftp") || this.protocol.includes("ssh"))
      return 22;
    // TODO: Add more default port numbers for other possible protocols
    return 0;
  }

  // Timing-related getters

  /**
   * Gets the uptime of the tab in milliseconds since its creation.
   * @returns {number} The uptime in milliseconds.
   */
  get uptime(): number {
    return Date.now() - this.createdAt;
  }

  /**
   * Gets the time elapsed since the tab was last accessed.
   * @returns {number} The elapsed time in milliseconds.
   */
  get msFromLastAccessed(): number {
    return Date.now() - Math.round(this.lastAccessed);
  }
}
