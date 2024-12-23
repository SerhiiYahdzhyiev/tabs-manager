import { Tab } from "../tab";
import { TabMaps } from "./tab-maps";
import { TabsMapOneToMany } from "../types";

import { simpleOneToOneMapUpdater, stringToIdsMapUpdater } from "./updaters";

export function initMaps() {
  const _urlToIds = new Map<string, number[]>();
  const _hostToIds = new Map<string, number[]>();

  const _idToTab = new Map<number, Tab>();
  const _idxToTab = new Map<number, Tab>();

  const maps = new TabMaps();

  maps.registerMap<number, Tab>("idToTab", _idToTab);
  maps.registerMap<number, Tab>("idxToTab", _idxToTab);
  maps.registerMap<string, number[]>("urlToIds", _urlToIds);
  maps.registerMap<string, Iterable<number>>("hostToIds", _hostToIds);

  maps.registerUpdater<Map<number, Tab>, number, Tab>(
    "idToTab",
    simpleOneToOneMapUpdater,
  );

  maps.registerUpdater<Map<number, Tab>, number, Tab>(
    "idxToTab",
    simpleOneToOneMapUpdater,
  );

  maps.registerUpdater<Map<string, number[]>, string, number>(
    "urlToIds",
    stringToIdsMapUpdater,
  );

  maps.registerUpdater<TabsMapOneToMany<string, number>, string, number>(
    "hostToIds",
    stringToIdsMapUpdater,
  );

  Object.assign(globalThis, { __maps__: maps });
}
