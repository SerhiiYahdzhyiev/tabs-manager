import { ITabMaps } from "../interfaces";
import { Tab } from "../tab";
import { ListenerFunction, TListenerFunction } from "./base";

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

  if (!__maps__.hasKey("idToTab", id)) {
    console.warn(id);
    throw Error("Failed to find updated tab by id!");
  }

  const tab = __maps__.getValue<number, Tab>("idToTab", id)!;

  if (urlChanged) {
    const url: string = (tab.url || tab.pendingUrl)!;
    // INFO: Remove id from old url entry...
    __maps__.updateMap("urlToIds", url, tab.id);

    const oldHost = tab.urlObj?.host;
    const newHost = new URL(changeInfo.url ?? "").host;

    if (newHost && newHost !== oldHost) {
      if (oldHost) __maps__.updateMap("hostToIds", oldHost, tab.id!);
      __maps__.updateMap("hostToIds", newHost, tab.id!);
    }
  }

  Object.assign(tab, changeInfo);

  if (urlChanged && (tab.url || tab.pendingUrl)) {
    const url: string = (tab.url || tab.pendingUrl)!;
    __maps__.updateMap("urlToIds", url, tab.id);
  }
}

Object.setPrototypeOf(updateListener, ListenerFunction);

export default updateListener.bind(
  updateListener as unknown as TListenerFunction,
);
