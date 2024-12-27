import { Tab } from "../tab";
import { ITabMaps } from "../interfaces";
import { ListenerFunction, TListenerFunction } from "./base";

declare const __maps__: ITabMaps;
declare let __tabs__: Tab[];
declare let _idxUpdateLock: number;

async function removeListener(this: TListenerFunction, id: number) {
  this.debug("Removed!");
  _idxUpdateLock++;
  const oldTab = __maps__.getValue<number, Tab>("idToTab", id)!;

  const host = oldTab?.urlObj?.host;
  if (host && __maps__.hasKey("hostToIds", host)) {
    __maps__.updateMap("hostToIds", host, id);
  } else {
    console.warn("Failed to get host removed tab!");
  }

  __tabs__ = __tabs__.filter((t) => t.id !== id);

  const url = (oldTab.url || oldTab.pendingUrl)!;
  if (__maps__.hasKey("urlToIds", url)) {
    __maps__.updateMap("urlToIds", url, id);
  }
  __maps__.updateMap("idToTab", id, null);
  _idxUpdateLock--;
}

Object.setPrototypeOf(removeListener, ListenerFunction);

export default removeListener.bind(
  removeListener as unknown as TListenerFunction,
);
