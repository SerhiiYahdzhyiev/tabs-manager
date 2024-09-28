import { getTabs } from "./env";

import { Tabs } from "./tabs";
import { Tab } from "./tab";

declare let _tabs: Tabs;

export class TabsManager {
  private _name: string = "default";

  constructor(options: Record<string, string>) {
    if (options.name) {
      this._name = options.name;
    }

    const browserTabs = getTabs();

    Object.assign(this, {
      create: browserTabs.create,
      connect: browserTabs.connect,
      discard: browserTabs.discard,
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
