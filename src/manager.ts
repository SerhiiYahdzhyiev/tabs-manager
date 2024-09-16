import { getTabs } from "./env";
import { Tabs } from "./tabs";
import { Tab } from "./tab";

declare let _tabs: Tabs;

export class TabsManager {
  private _name: string = "default";

  constructor(options: Record<string, any>) {
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
    cb: (tabs: Tab[], ...args: any[]) => ReturnType,
  ): (...args: any[]) => ReturnType {
    return (...args: any[]) => {
      //@ts-ignore
      return cb(_tabs._tabs, ...args);
    };
  }

  public getAll(): Tab[] {
    //@ts-ignore
    return _tabs._tabs;
  }

  public get(key: string | number): Tab | null {
    //@ts-ignore
    return _tabs.get(key);
  }

  public has(key: string | number): boolean {
    //@ts-ignore
    return _tabs.has(key);
  }
}
