import { TabsMapUpdater } from "../types";
/**
 * Update simple one-to-one map.
 *
 * Will set the value if it is not in the map.
 * Will overwrite the value with a new one if provided.
 * Will remove value if provided null as value.
 *
 * @param {Map} map - a map to update.
 * @param {any} key - a key to update
 * @param {any|null} value - new value or null (to remove a value with
 * provided key)
 *
 * @return undefined
 * @throws {Error} On invalid input, if map is anything except Map instance.
 * @function
 */
export function simpleOneToOneMapUpdater<MapType, K, V>(
  map: MapType,
  key: K,
  value: V,
): void {
  if (!map || !(map instanceof Map)) throw Error("Invalid input: " + map);
  if (!value) {
    (map as Map<K, V>).delete(key);
    return;
  }
  (map as Map<K, V>).set(key, value);
}

/**
 * Update simple one-to-many map of unique ids. Elements are kept in Array.
 *
 * Will set the value as single array element if it is not in the map.
 * Will add the value to the array of elements if not present.
 * Will remove value if it is already present in the array of elements by provided key.
 *
 * @param {Map<string, number[]>} map - a one-to-many map to update.
 * @param {string} key - a key to update.
 * @param {number} value - new value to add/remove from the array of elements stored by provided key.
 *
 * @return undefined
 * @throws {Error} On invalid input, if map is anything except Map instance, if value is null.
 * @function
 */
export const stringToIdsMapUpdater: TabsMapUpdater<
  Map<string, number[]>,
  string,
  number
> = (map, key, value): void => {
  if (!map || !(map instanceof Map)) throw Error("Invalid input: " + map);
  if (!value) {
    console.warn("Invalid value", value);
    return;
  }

  if (!map.has(key)) {
    map.set(key, [value]);
    return;
  }

  const ids = map.get(key)!;

  if (ids.includes(value)) {
    const newIds = ids.filter((i: number) => i !== value);
    if (!newIds.length) {
      map.delete(key);
      return;
    }
    map.set(key, newIds);
    return;
  }
  const newIds = [...ids, value];
  map.set(key, newIds);
};
