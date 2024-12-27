import { Browser } from "./api";
import { Tabs } from "./tabs";

import { isFirefox, withError } from "./utils";

import clearAllInputs from "./scripts/clearAllInputs";

declare let _tabs: Tabs;

export class Tab {
  active: boolean = false;
  id: number = -1;
  index: number = -1;
  windowId: number = -1;
  url: string = "";
  pendingUrl: string = "";

  createdAt: number;
  lastAccessed: number = Date.now();

  //TODO: Improve typehints...
  connect: CallableFunction;
  clearAllInputs: CallableFunction;
  close: CallableFunction;
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

  private _removed = false;
  public get removed() {
    return this._removed;
  }
  public get closed() {
    return this._removed;
  }

  private _withRemoved(cb: CallableFunction) {
    return (...args: unknown[]) => {
      if (this._removed) {
        console.warn("Cannot use operation on closed tab!");
        return;
      }
      return cb(...args);
    };
  }

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
    this.remove = this.close = this._withRemoved(
      this._withRemoved(withError(this._remove.bind(this))),
    );
    this.update = this._withRemoved(withError(this._update.bind(this)));

    this.focus = this._withRemoved(withError(this.focus.bind(this)));
    this.forceClose = this._withRemoved(withError(this.forceClose.bind(this)));
  }

  private async _discard(): Promise<Tab> {
    const rawTab = await Browser.getTabs().discard(this.id);
    _tabs.discard(this.id, rawTab.id!);
    Object.assign(this, rawTab);
    return this;
  }

  public async focus(): Promise<void> {
    // TODO: Consider making this behaviour configurable...
    await Browser.getWindows()?.update(this.windowId, {
      state: "normal",
      focused: true,
    });
    await this._update({ active: true });
    return;
  }

  private async _screenshot(options: chrome.tabs.CaptureVisibleTabOptions) {
    await this.focus();
    return await Browser.getTabs().captureVisibleTab(this.windowId, options);
  }

  private async _move(options: chrome.tabs.MoveProperties): Promise<Tab> {
    const moved = await Browser.getTabs().move(this.id, options);
    Object.assign(this, moved);
    return this;
  }

  private async _reload(options: chrome.tabs.ReloadProperties): Promise<void> {
    await Browser.getTabs().reload(this.id, options);
  }

  private async _goForward(): Promise<void> {
    await Browser.getTabs().goForward(this.id);
  }

  private async _goBack(): Promise<void> {
    await Browser.getTabs().goBack(this.id);
  }

  private async _duplicate(): Promise<void> {
    // TODO: Figure out how to handle returned tab here...
    await Browser.getTabs().duplicate(this.id);
  }

  private async _language(): Promise<string> {
    return await Browser.getTabs().detectLanguage(this.id);
  }

  private _connect(options: chrome.tabs.ConnectInfo): chrome.runtime.Port {
    return Browser.getTabs().connect(this.id, options);
  }

  private async _remove(): Promise<void> {
    this._removed = true;
    await Browser.getTabs().remove(this.id);
  }

  private async _update(options: chrome.tabs.UpdateProperties): Promise<Tab> {
    await Browser.getTabs().update(this.id, options);
    Object.assign(this, options);
    return this;
  }

  private async _clearAllInputs(): Promise<void> {
    const scripting = Browser.getScripting();
    if (!scripting)
      throw new Error("Scripting is not permitted or/and available!");

    await scripting.executeScript({
      target: { tabId: this.id },
      func: clearAllInputs,
    });
  }

  public async forceClose(): Promise<void> {
    if (isFirefox()) {
      const message = "This method is not supported on Firefox!";
      console.warn(message);
      throw new Error(message);
    }

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

  get urlObj(): URL | null {
    const url = this.url || this.pendingUrl;
    if (!url) return null;
    return new URL(url);
  }

  get host(): string {
    return this.urlObj?.host || "";
  }

  get hostname(): string {
    return this.urlObj?.hostname || "";
  }

  get origin(): string {
    return this.urlObj?.origin || "";
  }

  get href(): string {
    return this.urlObj?.href || "";
  }

  get protocol(): string {
    return this.urlObj?.protocol || "";
  }

  get username(): string {
    return this.urlObj?.username || "";
  }

  get hash(): string {
    return this.urlObj?.hash || "";
  }

  get password(): string {
    return this.urlObj?.password || "";
  }

  get pathname(): string {
    return this.urlObj?.pathname || "";
  }

  get search(): string {
    return this.urlObj?.search || "";
  }

  get searchParams(): URLSearchParams | null {
    return this.urlObj?.searchParams || null;
  }

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

  get uptime(): number {
    return Date.now() - this.createdAt;
  }

  // TODO: Think of better name for this one...
  get msFromLastAccessed(): number {
    return Date.now() - Math.round(this.lastAccessed);
  }
}
