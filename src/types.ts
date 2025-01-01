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

// TODO: Finalize the type...
export type TTab = chrome.tabs.Tab & {
  host: string;
};
