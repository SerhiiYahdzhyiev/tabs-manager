import { ITabMaps } from "../interfaces";
import { Tab } from "../tab";
import { ListenerFunction, TListenerFunction } from "./base";
import { MapName } from "../maps/map-names";
import { urlKeys } from "../maps/url-keys";
import { url } from "../utils/url";

declare const __maps__: ITabMaps;

async function updateListener(
  this: TListenerFunction,
  id: number,
  changeInfo: chrome.tabs.TabChangeInfo,
) {
  this.debug("Updated!");
  this.debug(id, changeInfo);

  const discarded = "discarded" in changeInfo && changeInfo.discarded === true;

  if (discarded) return;

  const urlChanged = "url" in changeInfo || "pendingUrl" in changeInfo;

  if (!__maps__.hasKey(MapName.ID_2_TAB, id)) {
    console.warn(id);
    throw Error("Failed to find updated tab by id!");
  }

  const tab = __maps__.getValue<number, Tab>(MapName.ID_2_TAB, id)!;

  if (urlChanged) {
    const _url: string = (tab.url || tab.pendingUrl)!;
    this.debug("url: ", _url);
    //@ts-ignore
    this.debug("urlsMap: ", __maps__._maps.get(MapName.URL_2_IDS));
    // INFO: Remove id from old url entry...
    __maps__.updateMap(MapName.URL_2_IDS, url(_url).href, tab.id);

    for (const key of urlKeys) {
      const oldValue = (tab as unknown as Record<MapName, string>)[key];
      const newUrl = new URL(changeInfo.url ?? "");
      const newValue = (newUrl as unknown as Record<MapName, string>)[key];

      if (newValue && newValue !== oldValue) {
        if (oldValue) __maps__.updateMap(key, oldValue, tab.id!);
        __maps__.updateMap(key, newValue, tab.id!);
      }
    }
  }

  Object.assign(tab, changeInfo);

  if (urlChanged && (tab.url || tab.pendingUrl)) {
    const _url: string = (tab.url || tab.pendingUrl)!;
    this.debug("url: ", _url);
    //@ts-ignore
    this.debug("urlsMap: ", __maps__._maps.get(MapName.URL_2_IDS));
    __maps__.updateMap(MapName.URL_2_IDS, url(_url).href, tab.id);
  }
}

Object.setPrototypeOf(updateListener, ListenerFunction);

export default updateListener.bind(
  updateListener as unknown as TListenerFunction,
);
