import { ITabMaps, TabsMap, TabsMapUpdater } from "./types";

export class TabMaps implements ITabMaps {
  private _maps = new Map();
  private _updaters = new Map();

  private _updateMap<K, V>(
    map: TabsMap<K, V>,
    updater: TabsMapUpdater<TabsMap<K, V>, K, V>,
    key: K,
    value: V,
  ) {
    updater(map, key, value);
  }

  public updateMap<K, V>(name: string, key: K, value: V) {
    if (!this._maps.has(name)) {
      // TODO: Replace with custom error
      throw new Error("No map registered with name: " + name);
    }
    if (!this._updaters.has(name)) {
      // TODO: Replace with custom error
      throw new Error("No updaters registered for map with name: " + name);
    }
    const map = this._maps.get(name)!;
    const updater = this._updaters.get(name)!;

    this._updateMap<K, V>(map, updater, key, value);
  }

  public registerMap<K, V>(name: string, map: TabsMap<K, V>) {
    if (this._maps.has(name)) {
      // TODO: Replace with custom error
      throw new Error("Duplicate map name: " + name);
    }
    this._maps.set(name, map);
  }

  public registerUpdater<MapType, K, V>(
    name: string,
    updater: TabsMapUpdater<MapType, K, V>,
  ) {
    if (this._updaters.has(name)) {
      // TODO: Replace with custom error
      throw new Error("Duplicate updater for: " + name);
    }
    this._updaters.set(name, updater);
  }
}
