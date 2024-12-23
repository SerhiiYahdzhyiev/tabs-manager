import { TabsMapUpdater, TabsMap } from "./types";

export interface IVersionable {
  version: string;
}

export interface ITabMaps {
  entries: <K, V>(mapName: string) => MapIterator<[K, V]>;
  getValue: <K, V>(mapName: string, key: K) => V | undefined;
  hasKey: <K>(mapName: string, key: K) => boolean;
  updateMap: <K, V>(mapName: string, key: K, value: V) => void;
  clearMap: (mapName: string) => void;
  registerMap: <K, V>(mapName: string, map: TabsMap<K, V>) => void;
  registerUpdater: <MapType, K, V>(
    mapName: string,
    updater: TabsMapUpdater<MapType, K, V>,
  ) => void;
}
