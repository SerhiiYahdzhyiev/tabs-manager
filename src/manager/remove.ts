import { Browser } from "../api";
import { ITabMaps } from "../interfaces";
import { MapName } from "../maps/map-names";
import { TTab } from "../types";

type Target = string | number | TTab;
type TThis = {
  executeManipulation: CallableFunction;
  _maps: ITabMaps;
};

async function _remove(tabId: number, __maps__: ITabMaps) {
  const oldTab = __maps__.getValue(MapName.ID_2_TAB, tabId)!;
  await Browser.getTabs().remove(tabId);
  Object.assign(oldTab, { _removed: true });
  return oldTab as TTab;
}

export async function remove(this: TThis, ...target: Target[]) {
  if (target.length === 1) {
    if (
      typeof target[0] === "string" &&
      (!+target[0] || !(target[0] as unknown as TTab)?.id)
    ) {
      throw new Error("Invalid taret for TabsManager.remove: " + target[0]);
    }
    return await _remove(
      +target[0] || ((target[0] as unknown as TTab)?.id as number),
      this._maps,
    );
  }

  const results = [];
  for (const item of target) {
    if (
      typeof target[0] === "string" &&
      (!+target[0] || !(target[0] as unknown as TTab)?.id)
    ) {
      console.warn(
        "Invalid taret for TabsManager.remove: " + target[0] + " ! Skipping...",
      );
      continue;
    }
    try {
      const ret = await _remove(
        +(item || ((item as unknown as TTab)?.id as number)),
        this._maps,
      );
      results.push(ret);
    } catch (e) {
      console.warn(e);
    }
  }
  return results;
}
