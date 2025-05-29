import { Browser } from "../api";
import { Listener } from "../types";
import { IListeners } from "../interfaces";

function getAPIListenerNamesFrom(name: string): string[] {
  switch (name) {
    case "activate":
      return ["onActivated"];
    case "create":
      return ["onCreated"];
    case "move":
      return ["onMoved"];
    case "remove":
      return ["onRemoved"];
    case "update":
      return ["onUpdated"];
    case "claenUrlMaps":
      return ["onRemoved", "onUpdated"];
    default:
      return [];
  }
}

export class Listeners implements IListeners {
  private _items: Map<string, Listener>;
  private __initialized__: boolean = false;

  public entries() {
    return this._items.entries();
  }

  public get initialized(): boolean {
    return this.__initialized__;
  }

  public register(name: string, listener: Listener) {
    this._items.set(name, listener);
  }

  public init(): void {
    for (const [name, listener] of this._items.entries()) {
      const tabs = Browser.getTabs();
      const _names: string[] = getAPIListenerNamesFrom(name);
      if (_names.length) {
        for (const name of _names) {
          (
            tabs as unknown as Record<
              string,
              {
                addListener: (listener: CallableFunction) => void;
              }
            >
          )[name].addListener(listener);
        }
      }
    }
    this.__initialized__ = true;
  }

  public destroy() {
    const tabs = Browser.getTabs();
    for (const [name, listener] of this._items.entries()) {
      const _names: string[] = getAPIListenerNamesFrom(name);
      if (_names.length) {
        for (const name of _names) {
          (
            tabs as unknown as Record<
              string,
              {
                removeListener: (listener: CallableFunction) => void;
              }
            >
          )[name].removeListener(listener);
        }
      }
    }
    this.__initialized__ = false;
  }

  constructor() {
    this._items = new Map<string, Listener>();
  }
}
