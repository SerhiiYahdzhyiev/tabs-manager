import { Tab } from "../tab";
import { ITabMaps } from "../interfaces";

import { ListenerFunction, TListenerFunction } from "./base";

declare const __maps__: ITabMaps;
declare let __tabs__: Tab[];
declare let _idxUpdateLock: number; // eslint-disable-line

async function createListener(this: TListenerFunction, tab: chrome.tabs.Tab) {
  this.debug("Created!");
  _idxUpdateLock++;
  const wrappedTab = new Tab(tab);
  __tabs__ = [...__tabs__, wrappedTab];
  __maps__.updateMap("idxToTab", __tabs__.length - 1, wrappedTab);
  if (!wrappedTab.id) {
    console.warn("Skipping tab without id!");
    console.warn("This tab will not be saved in id->tab map!");
    console.dir(tab);
    return;
  }
  __maps__.updateMap("idToTab", tab.id!, wrappedTab);

  if (!wrappedTab.url && !wrappedTab.pendingUrl) {
    console.warn("Skipping tab without both url and pendingUrl!");
    console.warn("This tab will not be saved in url->tab map!");
    return;
  }

  const url: string = (wrappedTab.url || wrappedTab.pendingUrl)!;
  __maps__.updateMap("urlToIds", url, wrappedTab.id);

  const host = wrappedTab.urlObj?.host;
  if (host) {
    __maps__.updateMap("hostToIds", host, wrappedTab.id!);
  } else {
    console.warn("Failed to get host on wrapped tab!");
  }
  _idxUpdateLock--;
}

Object.setPrototypeOf(createListener, ListenerFunction);

export default createListener.bind(
  createListener as unknown as TListenerFunction,
);
