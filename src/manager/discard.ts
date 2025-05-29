import { Browser } from "../api";
import { ITabMaps } from "../interfaces";
import { MapName } from "../maps/map-names";
import { Tab } from "../tab";

type Target = string | number | Tab;
type TThis = {
  executeManipulation: CallableFunction;
  _maps: ITabMaps;
  _updateUrlMaps: (tab: Tab) => void;
};

async function _discard(
  tabId: number,
  __maps__: ITabMaps,
  updateUrlMaps: (tab: Tab) => void,
) {
  const tab = await Browser.getTabs().discard(tabId);

  const oldTab = __maps__.getValue<number, Tab>(MapName.ID_2_TAB, tabId)!;

  const _disc = (oldId: number, newId: number) => {
    const tab = __maps__.getValue<number, Tab>(MapName.ID_2_TAB, oldId)!;
    __maps__.updateMap(MapName.ID_2_TAB, oldId, null);
    __maps__.updateMap(MapName.ID_2_TAB, newId, tab);
    __maps__.updateMap(MapName.URL_2_IDS, tab.url, oldId);
    __maps__.updateMap(MapName.URL_2_IDS, tab.url, newId);
  };
  _disc(tabId, tab?.id || tabId);
  updateUrlMaps(oldTab);
  updateUrlMaps(new Tab(tab));
  Object.assign(oldTab, tab || { discarded: true });
  return oldTab;
}

export async function discard(this: TThis, ...target: Target[]) {
  if (target.length === 1) {
    if (
      typeof target[0] === "string" &&
      (!+target[0] || !(target[0] as unknown as Tab)?.id)
    ) {
      throw new Error("Invalid taret for TabsManager.discard: " + target[0]);
    }
    return await _discard(
      +target[0] || (target[0] as Tab)?.id,
      this._maps,
      this._updateUrlMaps,
    );
  }
  const results = [];
  for (const item of target) {
    if (
      typeof target[0] === "string" &&
      (!+target[0] || !(target[0] as unknown as Tab)?.id)
    ) {
      console.warn(
        "Invalid taret for TabsManager.discard: " +
          target[0] +
          " ! Skipping...",
      );
      continue;
    }
    try {
      const ret = await _discard(
        +(item || ((item as unknown as Tab)?.id as number)),
        this._maps,
        this._updateUrlMaps,
      );
      results.push(ret);
    } catch (e) {
      console.warn(e);
    }
  }
  return results;
}
