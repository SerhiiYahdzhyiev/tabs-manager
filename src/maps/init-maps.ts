import { Tab } from "../tab";
import { TabMaps } from "./tab-maps";
import { TabsMapOneToMany } from "../types";

import { simpleOneToOneMapUpdater, stringToIdsMapUpdater } from "./updaters";
import { MapName } from "./map-names";

export function initMaps() {
  const _urlToIds = new Map<string, number[]>();
  const _hostToIds = new Map<string, number[]>();

  const _idToTab = new Map<number, Tab>();
  const _idxToTab = new Map<number, Tab>();

  const maps = new TabMaps();

  maps.registerMap<number, Tab>(MapName.ID_2_TAB, _idToTab);
  maps.registerMap<number, Tab>(MapName.IDX_2_TAB, _idxToTab);

  maps.registerMap<string, number[]>(MapName.URL_2_IDS, _urlToIds);
  maps.registerMap<string, number[]>(MapName.HOST_2_IDS, _hostToIds);

  maps.registerUpdater<Map<number, Tab>, number, Tab>(
    MapName.ID_2_TAB,
    simpleOneToOneMapUpdater,
  );

  maps.registerUpdater<Map<number, Tab>, number, Tab>(
    MapName.IDX_2_TAB,
    simpleOneToOneMapUpdater,
  );

  maps.registerUpdater<Map<string, number[]>, string, number>(
    MapName.URL_2_IDS,
    stringToIdsMapUpdater,
  );

  maps.registerUpdater<TabsMapOneToMany<string, number>, string, number>(
    MapName.HOST_2_IDS,
    stringToIdsMapUpdater,
  );

  Object.assign(globalThis, { __maps__: maps });
}
