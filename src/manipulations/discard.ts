import { TTab } from "../types";
import { ITabMaps } from "../interfaces";
import { MapName } from "../maps/map-names";
import { Browser } from "../api";
import { TabManipulation, TTabManipulation } from "./base";
import { Tab } from "../tab";

async function discard(
  tabId: number,
  __maps__: ITabMaps,
  updateUrlMaps: (tab: Tab) => void,
) {
  const tab = await Browser.getTabs().discard(tabId);

  const oldTab = __maps__.getValue<number, Tab>(MapName.ID_2_TAB, tabId)!;

  const _discard = (oldId: number, newId: number) => {
    const tab = __maps__.getValue<number, TTab>(MapName.ID_2_TAB, oldId)!;
    __maps__.updateMap(MapName.ID_2_TAB, oldId, null);
    __maps__.updateMap(MapName.ID_2_TAB, newId, tab);
    __maps__.updateMap(MapName.URL_2_IDS, tab.url, oldId);
    __maps__.updateMap(MapName.URL_2_IDS, tab.url, newId);
  };
  _discard(tabId, tab?.id || tabId);
  updateUrlMaps(oldTab);
  updateUrlMaps(new Tab(tab));
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
