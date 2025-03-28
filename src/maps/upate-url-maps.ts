import { ITabMaps } from "../interfaces";
import { Tab } from "../tab";
import { urlKeys } from "./url-keys";
import { MapName } from "./map-names";

declare const __maps__: ITabMaps;

export function updateUrlMaps(tab: Tab): void {
  for (const key of urlKeys) {
    const value = (tab as unknown as Record<MapName, string>)[key];
    if (value) __maps__.updateMap(key, value, tab.id);
  }
}
