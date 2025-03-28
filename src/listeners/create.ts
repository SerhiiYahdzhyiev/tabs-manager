import { ITabMaps } from "../interfaces";
import { MapName } from "../maps/map-names";
import { Tab } from "../tab";

import { ListenerFunction, TListenerFunction } from "./base";

import updateIndexes from "./update-indexes";
import { updateUrlMaps } from "../maps/upate-url-maps";
import { url } from "../utils/url";

declare const __maps__: ITabMaps;
declare let __tabs__: Tab[];

async function createListener(this: TListenerFunction, tab: chrome.tabs.Tab) {
  this.debug("Created!");
  const wrappedTab = new Tab(tab);
  __tabs__ = [...__tabs__, wrappedTab];
  __maps__.updateMap(MapName.ID_2_TAB, __tabs__.length - 1, wrappedTab);
  if (!wrappedTab.id) {
    console.warn("Skipping tab without id!");
    console.warn("This tab will not be saved in id->tab map!");
    console.dir(tab);
    return;
  }
  __maps__.updateMap(MapName.ID_2_TAB, tab.id!, wrappedTab);

  if (!wrappedTab.url && !wrappedTab.pendingUrl) {
    console.warn("Skipping tab without both url and pendingUrl!");
    console.warn("This tab will not be saved in url->tab map!");
    return;
  }

  const _url: string = (wrappedTab.url || wrappedTab.pendingUrl)!;
  __maps__.updateMap(MapName.URL_2_IDS, url(_url).href, wrappedTab.id);

  // TODO: Move it below index updation ?
  updateUrlMaps(wrappedTab);

  await updateIndexes();
}

Object.setPrototypeOf(createListener, ListenerFunction);

export default createListener.bind(
  createListener as unknown as TListenerFunction,
);
