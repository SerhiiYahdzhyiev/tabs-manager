import { IVersionable } from "./interfaces";
import { getTabs } from "./env";

import { Tabs } from "./tabs";
import { Tab } from "./tab";

declare let _tabs: Tabs;

export class TabsManager implements IVersionable {
  // TODO: Realize version insertion from build system
  //       in a format of a hex digit.
  private static __version__ = "0.1.0";

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

    const browserTabs = getTabs();

    Object.assign(this, {
      create: browserTabs.create,
      connect: browserTabs.connect,
      discard: browserTabs.discard,
      query: browserTabs.query,
      remove: browserTabs.remove,
      reload: browserTabs.reload,
      update: browserTabs.update,
    });

    Object.assign(this, {
      [Symbol.toStringTag]: `TabsManager ${this._name}`,
    });
  }

  public static withTabs<ReturnType>(
    cb: <TArgs>(tabs: Tab[], ...args: TArgs[]) => ReturnType,
  ): <TArgs>(...args: TArgs[]) => ReturnType {
    return <TArgs>(...args: TArgs[]) => {
      return cb(_tabs.tabs, ...args);
    };
  }

  public getActive(): Tab | null {
    if (_tabs.activeId) {
      return _tabs.get(_tabs.activeId) as Tab;
    }
    return null;
  }

  public getAll(): Tab[] {
    return _tabs.tabs;
  }

  public get(key: string | number): Tab | Tab[] | null {
    return _tabs.get(key);
  }

  public has(key: string | number): boolean {
    return _tabs.has(key);
  }
}
