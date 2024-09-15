"use strict";

import { Tab } from "./tab";
import { Tabs } from "./tabs";
import { assertEnv, getEnvType, getRuntime } from "./env";

const requiredPermissions = ["tabs", "activeTab"];

(() => {
  if (!assertEnv(getEnvType())) {
    console.warn("This environment is not suitable for TabsManager!");
    return 1;
  }

  const manifestPermissions = getRuntime().getManifest()["permissions"];

  const requiredPermissionsGranted = requiredPermissions.every((permission) =>
    manifestPermissions.includes(permission),
  );

  if (!requiredPermissionsGranted) {
    console.warn(
      "This extension does not have a required permissions for TabsManager!",
    );
    return 1;
  }

  // INFO: Globals assignment...
  Object.assign(globalThis, { envType: getEnvType() });
  Object.assign(globalThis, { _tabs: new Tabs() });

  class TabsManager {
    constructor(options: Record<string, any>) {
      // TODO: Make an actual use of options...
      console.log(options);

      const browserTabs = getTabs();

      Object.assign(this, {
        create: browserTabs.create,
        connect: browserTabs.connect,
        discard: browserTabs.discard,
        remove: browserTabs.remove,
        reload: browserTabs.reload,
        update: browserTabs.update,
      });
    }

    public static withTabs<ReturnType>(
      cb: (tabs: Tabs, ...args: any[]) => ReturnType,
    ): (...args: any[]) => ReturnType {
      return (...args: any[]) => {
        //@ts-ignore
        return cb(_tabs._tabs, ...args);
      };
    }

    public getAll(): Tab {
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

  Object.assign(globalThis, { TabsManager: TabsManager });
})();
