import { TTab } from "../types";
import { ITabMaps } from "../interfaces";
import { MapName } from "../maps/map-names";
import { Browser } from "../api";
import { TabManipulation, TTabManipulation } from "./base";

declare const __maps__: ITabMaps;

function _discard(oldId: number, newId: number) {
  const tab = __maps__.getValue<number, TTab>(MapName.ID_2_TAB, oldId)!;
  __maps__.updateMap(MapName.ID_2_TAB, oldId, null);
  __maps__.updateMap(MapName.ID_2_TAB, newId, tab);
  __maps__.updateMap(MapName.URL_2_IDS, tab.url, oldId);
  __maps__.updateMap(MapName.URL_2_IDS, tab.url, newId);
  if (tab.host) __maps__.updateMap(MapName.HOST_2_IDS, tab.host, oldId);
  if (tab.host) __maps__.updateMap(MapName.HOST_2_IDS, tab.host, newId);
}

async function discard(tabId: number) {
  const tab = await Browser.getTabs().discard(tabId);

  const oldTab = __maps__.getValue(MapName.ID_2_TAB, tabId)!;
  _discard(tabId, tab?.id || tabId);
  Object.assign(oldTab, tab || { discarded: true });
  return oldTab;
}

Object.setPrototypeOf(discard, TabManipulation);

discard._getArgsFrom = function (target: number | string | TTab): number {
  return typeof (target as TTab).id !== "undefined"
    ? (target as TTab).id!
    : +(target as number);
};

export default discard as unknown as TTabManipulation;
