"use strict";

declare let __tabs__: Tab[];
declare let _activeId: number; // eslint-disable-line
declare let __maps__: ITabMaps;

Object.assign(globalThis, { __debug__: true });
Object.assign(globalThis, { _idxUpdateLock: 0 });
Object.assign(globalThis, { _activeId: 0 });

import { Environment } from "./env";
import { Browser } from "./api";

import { Tabs } from "./tabs";
import { Tab } from "./tab";
import { TabsManager } from "./manager";

import { initMaps } from "./maps/init-maps";
import { initListeners } from "./listeners/init";
import { ITabMaps } from "./interfaces";

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
  Object.assign(globalThis, { _tabs: new Tabs() });

  initMaps();
  initListeners();

  const tabs = Browser.getTabs();

  tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
    __tabs__ = tabs.map((t: chrome.tabs.Tab) => new Tab(t));
    __tabs__.forEach((tab: Tab) => {
      if (tab.active) {
        _activeId = tab.id;
      }
      __maps__.updateMap("idToTab", tab.id!, tab);
      const url = (tab.url || tab.pendingUrl)!;
      const host = new URL(url).host;
      if (host) {
        __maps__.updateMap("hostToIds", host, tab.id!);
      }
      __maps__.updateMap("urlToIds", url, tab.id!);
      __maps__.updateMap("idxToTab", tab.index, tab);
    });
  });

  Object.assign(globalThis, { TabsManager: TabsManager });
})();
