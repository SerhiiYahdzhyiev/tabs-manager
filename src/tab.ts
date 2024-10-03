import { getScripting, getTabs } from "./env";
import { withError } from "./utils";
import clearAllInputs from "./scripts/clearAllInputs";

export class Tab {
  id: number = -1;
  url: string = "";
  pendingUrl: string = "";
  createdAt: number;
  lastAccessed: number = Date.now();

  connect: CallableFunction;
  clearAllInputs: CallableFunction;
  duplicate: CallableFunction;
  getLanguage: CallableFunction;
  goBack: CallableFunction;
  goForward: CallableFunction;
  remove: CallableFunction;
  update: CallableFunction;

  private _removed = false;

  constructor(tab: chrome.tabs.Tab) {
    Object.assign(this, tab);
    Object.assign(this, {
      [Symbol.toStringTag]: `Tab.${this.urlObj.host || "broken"}`,
    });

    this.createdAt = Date.now();

    this.connect = withError(this._connect.bind(this));
    this.clearAllInputs = withError(this._clearAllInputs.bind(this));
    this.duplicate = withError(this._duplicate.bind(this));
    this.goBack = withError(this._goBack.bind(this));
    this.goForward = withError(this._goForward.bind(this));
    this.getLanguage = withError(this._language.bind(this));
    this.remove = withError(this._remove.bind(this));
    this.update = withError(this._update.bind(this));
  }

  private async _goForward() {
    try {
      await getTabs().goForward(this.id);
    } catch (e) {
      throw e;
    }
  }

  private async _goBack() {
    try {
      await getTabs().goBack(this.id);
    } catch (e) {
      throw e;
    }
  }

  private async _duplicate() {
    try {
      await getTabs().duplicate(this.id);
    } catch (e) {
      throw e;
    }
  }

  private async _language() {
    try {
      return await getTabs().detectLanguage(this.id);
    } catch (e) {
      throw e;
    }
  }

  private async _connect(options: chrome.tabs.ConnectInfo) {
    try {
      await getTabs().connect(this.id, options);
    } catch (e) {
      throw e;
    }
  }

  private async _remove() {
    try {
      await getTabs().remove(this.id);
      this._removed = true;
    } catch (e) {
      throw e;
    }
  }

  private async _update(options: chrome.tabs.UpdateProperties) {
    try {
      await getTabs().update(this.id, options);
      Object.assign(this, options);
      return this;
    } catch (e) {
      throw e;
    }
  }

  private async _clearAllInputs() {
    try {
      const scripting = getScripting();
      if (!scripting)
        throw new Error("Scripting is not permitted or/and available!");

      await scripting.executeScript({
        target: { tabId: this.id },
        func: clearAllInputs,
      });
    } catch (e) {
      throw e;
    }
  }

  get urlObj(): URL {
    return new URL(this.url || this.pendingUrl || "");
  }

  get uptime(): number {
    return Date.now() - this.createdAt;
  }

  // TODO: Think of better name for this one...
  get msFromLastAccessed(): number {
    return Date.now() - Math.round(this.lastAccessed);
  }
}
