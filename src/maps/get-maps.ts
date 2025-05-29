import { Tab } from "../tab";
import { TabMaps } from "./tab-maps";

import { simpleOneToOneMapUpdater, stringToIdsMapUpdater } from "./updaters";
import { MapName } from "./map-names";
import { urlKeys } from "./url-keys";

export function getMaps() {
  const _urlToIds = new Map<string, number[]>();

  const _idToTab = new Map<number, Tab>();
  const _idxToTab = new Map<number, Tab>();

  const maps = new TabMaps();

  maps.registerMap<number, Tab>(MapName.ID_2_TAB, _idToTab);
  maps.registerMap<number, Tab>(MapName.IDX_2_TAB, _idxToTab);

  maps.registerMap<string, number[]>(MapName.URL_2_IDS, _urlToIds);

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

  for (const key of urlKeys) {
    const map = new Map<string, number[]>();
    maps.registerMap<string, number[]>(key, map);
    maps.registerUpdater<Map<string, number[]>, string, number>(
      key,
      stringToIdsMapUpdater,
    );
  }

return maps;
}
