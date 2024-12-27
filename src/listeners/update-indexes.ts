import { ITabMaps } from "../interfaces";
import { Tab } from "../tab";
import { Browser } from "../api";
import { ListenerFunction, TListenerFunction } from "./base";

import { sleep } from "../utils";

declare const __maps__: ITabMaps;
declare let __tabs__: Tab[];
declare let _idxUpdateLock: number;

async function updateIndexes(this: TListenerFunction) {
  this.debug("Updating indecies...");
  while (_idxUpdateLock > 0) {
    this.debug("Waiting for index update lock release...");
    await sleep(100);
  }
  _idxUpdateLock++;
  // INFO: Probably rebuilding the entire map is not the efficient way,
  //       but I've struggled to write it differently without introducing
  //       internal structures' consistency bugs...
  // TODO: Try to write more efficient updating algorithm...
  __maps__.clearMap("idxToTab");
  for (const tab of __tabs__) {
    const internalIdx = tab.index;
    this.debug("Internal index: " + internalIdx);
    const realIdx = (await Browser.getTabs().get(tab.id)).index;
    this.debug("Real index: " + realIdx);
    tab.index = realIdx;
    __maps__.updateMap("idxToTab", realIdx, tab);
  }
  _idxUpdateLock--;
}

Object.setPrototypeOf(updateIndexes, ListenerFunction);

export default updateIndexes.bind(
  updateIndexes as unknown as TListenerFunction,
);
