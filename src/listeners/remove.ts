import { Tab } from "../tab";
import { ITabMaps } from "../interfaces";
import { ListenerFunction, TListenerFunction } from "./base";

import updateIndexes from "./update-indexes";
import { updateUrlMaps } from "../maps/upate-url-maps";
import { url } from "../utils/url";
import { MapName } from "../maps/map-names";

declare const __maps__: ITabMaps;
declare let __tabs__: Tab[];

async function removeListener(this: TListenerFunction, id: number) {
  this.debug("Removed!");
  const oldTab = __maps__.getValue<number, Tab>(MapName.ID_2_TAB, id)!;

  updateUrlMaps(oldTab);

  __tabs__ = __tabs__.filter((t) => t.id !== id);

  const _url = (oldTab.url || oldTab.pendingUrl)!;
  if (__maps__.hasKey(MapName.URL_2_IDS, url(_url).href)) {
    __maps__.updateMap(MapName.URL_2_IDS, url(_url).href, id);
  }
  __maps__.updateMap(MapName.ID_2_TAB, id, null);
  await updateIndexes();
}

Object.setPrototypeOf(removeListener, ListenerFunction);

export default removeListener.bind(
  removeListener as unknown as TListenerFunction,
);
