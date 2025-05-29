import { Browser } from "../api";
import { ITabMaps } from "../interfaces";
import { MapName } from "../maps/map-names";
import { updateUrlMaps } from "../maps/upate-url-maps";
import { Tab } from "../tab";

declare let _activeId: number; // eslint-disable-line
declare let __initialized__: boolean;

export function initTabs(__tabs__: Tab[], __maps__: ITabMaps) {
  const tabs = Browser.getTabs();

  tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
    __tabs__ = tabs.map((t: chrome.tabs.Tab) => new Tab(t));
    __tabs__.forEach((tab: Tab) => {
      if (tab.active) {
        _activeId = tab.id;
      }
      __maps__.updateMap(MapName.ID_2_TAB, tab.id!, tab);
      __maps__.updateMap(MapName.IDX_2_TAB, tab.index, tab);
      const url = (tab.url || tab.pendingUrl)!;
      __maps__.updateMap(MapName.URL_2_IDS, url, tab.id!);
      updateUrlMaps(tab);
      __initialized__ = true;
    });
  });
}
