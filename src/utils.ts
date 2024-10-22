import { TabsMapUpdater } from "./types";

export function ensureClosingSlash(url: string): string {
  const lastChar = url.split("").toReversed()[0];
  if (lastChar === "/") {
    return url;
  }
  return url + "/";
}

export function simpleOneToOneMapUpdater<MapType, K, V>(
  map: MapType,
  key: K,
  value: V,
) {
  if (!value) {
    (map as Map<K, V>).delete(key);
    return;
  }
  //TODO: Add Extra validations
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

export function withError(cb: CallableFunction): CallableFunction {
  return async (...args: unknown[]) => {
    let error = null;
    let result;
    try {
      result = await cb(...args);
    } catch (e: unknown) {
      error = {
        message: String(e),
        stack: new Error().stack,
      };
    } finally {
      return [error, result];
    }
  };
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
