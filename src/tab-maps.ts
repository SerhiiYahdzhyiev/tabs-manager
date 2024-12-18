import { ITabMaps, TabsMap, TabsMapUpdater } from "./types";

/**
 * Class for managing multiple named maps and their associated updaters.
 * Designed to facilitate dynamic updates to maps via registered updater functions.
 */
export class TabMaps implements ITabMaps {
  private _maps = new Map<string, any>();
  private _updaters = new Map<string, TabsMapUpdater<any, any, any>>();

  /**
   * Internal helper to apply an updater function to a specific map.
   *
   * @template K - The type of the keys in the map.
   * @template V - The type of the values in the map.
   * @param {TabsMap<K, V>} map - The map to update.
   * @param {TabsMapUpdater<TabsMap<K, V>, K, V>} updater - The updater function.
   * @param {K} key - The key in the map to update or insert.
   * @param {V} value - The value to associate with the key.
   */
  private _updateMap<K, V>(
    map: TabsMap<K, V>,
    updater: TabsMapUpdater<TabsMap<K, V>, K, V>,
    key: K,
    value: V,
  ) {
    updater(map, key, value);
  }

  /**
   * Updates a map with the specified key-value pair using the registered updater.
   *
   * @template K - The type of the keys in the map.
   * @template V - The type of the values in the map.
   * @param {string} name - The name of the map to update.
   * @param {K} key - The key to update or insert.
   * @param {V} value - The value to associate with the key.
   * @throws {Error} If the map or its updater is not registered.
   */
  public updateMap<K, V>(name: string, key: K, value: V) {
    if (!this._maps.has(name)) {
      throw new Error("No map registered with name: " + name);
    }
    if (!this._updaters.has(name)) {
      throw new Error("No updaters registered for map with name: " + name);
    }
    const map = this._maps.get(name)!;
    const updater = this._updaters.get(name)!;

    this._updateMap<K, V>(map, updater, key, value);
  }

  /**
   * Registers a new named map.
   *
   * @template K - The type of the keys in the map.
   * @template V - The type of the values in the map.
   * @param {string} name - The name to associate with the map.
   * @param {TabsMap<K, V>} map - The map to register.
   * @throws {Error} If a map with the given name is already registered.
   */
  public registerMap<K, V>(name: string, map: TabsMap<K, V>) {
    if (this._maps.has(name)) {
      throw new Error("Duplicate map name: " + name);
    }
    this._maps.set(name, map);
  }

  /**
   * Registers an updater function for a specific map.
   *
   * @template MapType - The type of the map the updater modifies.
   * @template K - The type of the keys in the map.
   * @template V - The type of the values in the map.
   * @param {string} name - The name of the map to associate the updater with.
   * @param {TabsMapUpdater<MapType, K, V>} updater - The updater function to register.
   * @throws {Error} If an updater for the given map name is already registered.
   */
  public registerUpdater<MapType, K, V>(
    name: string,
    updater: TabsMapUpdater<MapType, K, V>,
  ) {
    if (this._updaters.has(name)) {
      throw new Error("Duplicate updater for: " + name);
    }
    this._updaters.set(name, updater);
  }
}
