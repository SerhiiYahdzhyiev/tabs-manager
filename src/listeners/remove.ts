import { Tab } from "../tab";
import { ITabMaps } from "../interfaces";
import { ListenerFunction, TListenerFunction } from "./base";

import updateIndexes from "./update-indexes";

declare const __maps__: ITabMaps;
declare let __tabs__: Tab[];

async function removeListener(this: TListenerFunction, id: number) {
  this.debug("Removed!");
  const oldTab = __maps__.getValue<number, Tab>("idToTab", id)!;

  const host = oldTab?.host;
  if (host && __maps__.hasKey("hostToIds", host)) {
    __maps__.updateMap("hostToIds", host, id);
  } else {
    console.warn("Failed to get host of removed tab!");
  }

  __tabs__ = __tabs__.filter((t) => t.id !== id);

  const url = (oldTab.url || oldTab.pendingUrl)!;
  if (__maps__.hasKey("urlToIds", url)) {
    __maps__.updateMap("urlToIds", url, id);
  }
  __maps__.updateMap("idToTab", id, null);
  await updateIndexes();
}

Object.setPrototypeOf(removeListener, ListenerFunction);

export default removeListener.bind(
  removeListener as unknown as TListenerFunction,
);
