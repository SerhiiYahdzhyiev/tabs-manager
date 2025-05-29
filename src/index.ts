"use strict";

// INFO: Globals assignment...
Object.assign(globalThis, { __debug__: true });

import { Environment } from "./env";
import { Browser } from "./api";

import { TabsManager } from "./manager/index";

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
  Object.assign(globalThis, { envType: Environment.getEnvType() });
  Object.assign(globalThis, { TabsManager: TabsManager });
})();
