"use strict";

Object.assign(globalThis, { __debug__: true });

import { Environment } from "./env";
import { Browser } from "./api";

import { Tabs } from "./tabs";
import { TabsManager } from "./manager";
import { initMaps } from "./maps/init-maps";

const requiredPermissions = ["tabs", "activeTab"];

(() => {
  if (!Environment.assertEnv(Environment.getEnvType())) {
    console.warn("This environment is not suitable for TabsManager!");
    return 1;
  }

  const manifestPermissions = Browser.getRuntime().getManifest()["permissions"];

  const requiredPermissionsGranted = requiredPermissions.every((permission) =>
    (manifestPermissions as string[])?.includes(permission),
  );

  if (!requiredPermissionsGranted) {
    console.warn(
      "This extension does not have a required permissions for TabsManager!",
    );
    return 1;
  }

  // INFO: Globals assignment...
  Object.assign(globalThis, { envType: Environment.getEnvType() });
  Object.assign(globalThis, { _tabs: new Tabs() });

  initMaps();

  Object.assign(globalThis, { TabsManager: TabsManager });
})();
