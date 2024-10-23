import { TabsMapUpdater } from "./types";

/**
 * Return passed string with a '/' in the end.
 *
 * @param {string} url - a url or any other string to add '/' to.
 *
 * @return {stirng} New string with a '/' at the end.
 * @throws {Error} On invalid input including empty strings. 
 * @function
 */
export function ensureClosingSlash(url: string): string {
  const lastChar = url.split("").toReversed()[0];
  if (lastChar === "/") {
    return url;
  }
  return url + "/";
}

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

export const stringToIdsMapUpdater: TabsMapUpdater<
  Map<string, number[]>,
  string,
  number
> = (map, key, value) => {
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
