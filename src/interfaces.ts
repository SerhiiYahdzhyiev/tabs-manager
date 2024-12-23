import { TabsMapUpdater, TabsMap } from "./types";

export interface IVersionable {
  version: string;
}

export interface ITabMaps {
  updateMap: <K, V>(mapName: string, key: K, value: V) => void;
  registerMap: <K, V>(mapName: string, map: TabsMap<K, V>) => void;
  registerUpdater: <MapType, K, V>(
    mapName: string,
    updater: TabsMapUpdater<MapType, K, V>,
  ) => void;
}
