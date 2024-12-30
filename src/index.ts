"use strict";

// INFO: Globals assignment...
Object.assign(globalThis, { __debug__: true });
Object.assign(globalThis, { _idxUpdateLock: 0 });
Object.assign(globalThis, { _activeId: 0 });

import { Environment } from "./env";
import { Browser } from "./api";

import { TabsManager } from "./manager";

import { initMaps } from "./maps/init-maps";
import { initListeners } from "./listeners/init";
import { initTabs } from "./tabs/init";

const requiredPermissions = ["tabs", "activeTab"];

(() => {
  if (!Environment.assertEnv(Environment.getEnvType())) {
    console.error("This environment is not suitable for TabsManager!");
    return 1;
  }

  const manifestPermissions = Browser.getRuntime().getManifest()["permissions"];

  const requiredPermissionsGranted = requiredPermissions.every((permission) =>
    (manifestPermissions as string[])?.includes(permission),
  );

  if (!requiredPermissionsGranted) {
    console.error(
      "This extension does not have a required permissions for TabsManager!",
    );
    return 1;
  }

  // INFO: Globals assignment...
  Object.assign(globalThis, { __tabs__: [] });
  Object.assign(globalThis, { envType: Environment.getEnvType() });

  initMaps();
  initListeners();
  initTabs();

  Object.assign(globalThis, { TabsManager: TabsManager });
})();
