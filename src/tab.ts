import { getTabs } from "./env";
import { withError } from "./utils";

export class Tab {
  id: number = -1;
  url: string = "";
  pendingUrl: string = "";
  createdAt: number;
  lastAccessed: number = Date.now();
  remove: CallableFunction;
  update: CallableFunction;

  private _removed = false;

  constructor(tab: chrome.tabs.Tab) {
    Object.assign(this, tab);
    Object.assign(this, {
      [Symbol.toStringTag]: `Tab.${this.urlObj.host || "broken"}`,
    });

    this.createdAt = Date.now();

    this.remove = withError(this._remove.bind(this));
    this.update = withError(this._update.bind(this));
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
      const updated = await getTabs().update(this.id, options);
      Object.assign(this, updated);
      return this;
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
