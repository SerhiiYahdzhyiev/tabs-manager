"use strict";

import { Tabs } from "./tabs";
import { TabsManager } from "./manager";
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


  Object.assign(globalThis, { TabsManager: TabsManager });
})();
