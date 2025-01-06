import { ITabMaps } from "../interfaces";
import { Tab } from "../tab";
import { Browser } from "../api";
import { ListenerFunction, TListenerFunction } from "./base";

declare const __maps__: ITabMaps;
declare let __tabs__: Tab[];

async function updateIndexes(this: TListenerFunction) {
  this.debug("Updating indecies...");
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
}

Object.setPrototypeOf(updateIndexes, ListenerFunction);

export default updateIndexes.bind(
  updateIndexes as unknown as TListenerFunction,
);
