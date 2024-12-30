import { Tab } from "./tab";
import { ITabMaps } from "./interfaces";
import { MapName } from "./maps/map-names";

declare const __maps__: ITabMaps;

export function discard(oldId: number, newId: number) {
  const tab = __maps__.getValue<number, Tab>(MapName.ID_2_TAB, oldId)!;
  __maps__.updateMap(MapName.ID_2_TAB, oldId, null);
  __maps__.updateMap(MapName.ID_2_TAB, newId, tab);
  __maps__.updateMap(MapName.URL_2_IDS, tab.url, oldId);
  __maps__.updateMap(MapName.URL_2_IDS, tab.url, newId);
  if (tab.urlObj?.host)
    __maps__.updateMap(MapName.HOST_2_IDS, tab.urlObj?.host, oldId);
  if (tab.urlObj?.host)
    __maps__.updateMap(MapName.HOST_2_IDS, tab.urlObj?.host, newId);
}
