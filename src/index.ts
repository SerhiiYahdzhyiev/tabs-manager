"use strict";

// INFO: Globals assignment...
Object.assign(globalThis, { __debug__: true });
Object.assign(globalThis, { _activeId: 0 });

import { Environment } from "./env";
import { Browser } from "./api";

import { TabsManager } from "./manager/index";

import { getMaps } from "./maps/get-maps";
import { initListeners } from "./listeners/init";
import { initTabs } from "./tabs/init";
import { TabMaps } from "./maps/tab-maps";

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
  Object.assign(globalThis, { __initialized__: false });
  Object.assign(globalThis, { __tabs__: [] });
  Object.assign(globalThis, { __maps__: getMaps() });
  Object.assign(globalThis, { envType: Environment.getEnvType() });

  getMaps();
  // initListeners();
  //@ts-ignore
  initTabs(globalThis.__tabs__, globalThis.__maps__ );

  Object.assign(globalThis, { TabsManager: TabsManager });
})();
