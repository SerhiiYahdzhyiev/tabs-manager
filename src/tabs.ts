import { Tab } from "./tab";
import { ITabMaps } from "./interfaces";

declare const __maps__: ITabMaps;

export class Tabs {
  public discard(oldId: number, newId: number) {
    // TODO: Refactor?..
    const tab = __maps__.getValue<number, Tab>("idToTab", oldId)!;
    __maps__.updateMap("idToTab", oldId, null);
    __maps__.updateMap("idToTab", newId, tab);
    __maps__.updateMap("urlToIds", tab.url, oldId);
    __maps__.updateMap("urlToIds", tab.url, newId);
    if (tab.urlObj?.host)
      __maps__.updateMap("hostToIds", tab.urlObj?.host, oldId);
    if (tab.urlObj?.host)
      __maps__.updateMap("hostToIds", tab.urlObj?.host, newId);
  }
}
