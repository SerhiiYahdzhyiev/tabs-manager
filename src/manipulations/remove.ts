import { TTab } from "../types";
import { ITabMaps } from "../interfaces";
import { MapName } from "../maps/map-names";
import { Browser } from "../api";
import { TabManipulation, TTabManipulation } from "./base";

declare const __maps__: ITabMaps;

async function remove(tabId: number): Promise<TTab> {
  const oldTab = __maps__.getValue(MapName.ID_2_TAB, tabId)!;
  await Browser.getTabs().remove(tabId);
  Object.assign(oldTab, { _removed: true });
  return oldTab as TTab;
}

Object.setPrototypeOf(remove, TabManipulation);

remove._getArgsFrom = function (target: number | string | TTab): number {
  return typeof (target as TTab).id !== "undefined"
    ? (target as TTab).id!
    : +(target as number);
};

export default remove as unknown as TTabManipulation;
