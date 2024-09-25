export enum EnvironmentType {
  WINDOW = "window",
  WORKER = "worker",
  INVALID = "invalid",
}

export type TabsMapOneToMany<K, V> = Map<K, Array<V>>;
export type TabsMapManyToOne<K, V> = Array<[K, V]>;
export type TabsMap<K, V> =
  | Map<K, V>
  | TabsMapManyToOne<K, V>
  | TabsMapOneToMany<K, V>;

export type TabsMapUpdater<MapType, K, V> = (
  map: MapType,
  key: K,
  value: V | null,
) => void;

export interface ITabMaps {
  updateMap: <K, V>(mapName: string, key: K, value: V) => void;
  registerMap: <K, V>(mapName: string, map: TabsMap<K, V>) => void;
  registerUpdater: <MapType, K, V>(
    mapName: string,
    updater: TabsMapUpdater<MapType, K, V>,
  ) => void;
}
