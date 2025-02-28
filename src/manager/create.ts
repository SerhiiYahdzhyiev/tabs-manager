import { Browser } from "../api";
import { getPropsToArgs } from "../args/index";

import { ITabMaps } from "../interfaces";
import { ManipulationName } from "../manipulations/names";
import { MapName } from "../maps/map-names";

import { sleep } from "../utils/process";

type Props = chrome.tabs.CreateProperties;

declare let __maps__: ITabMaps;

export async function create(...props: Props[]) {
  let ret;
  if (!props?.length) {
    ret = await Browser.getTabs().create({});
    // TODO: Get rid of sleep...
    await sleep(200);
    return __maps__.getValue(MapName.ID_2_TAB, ret.id);
  }
  const getArgsFrom = getPropsToArgs(ManipulationName.CREATE)!;
  const args = getArgsFrom(...props);

  if (!(args instanceof Array)) {
    ret = await Browser.getTabs().create(args);
    // TODO: Get rid of sleep...
    await sleep(200);
    return __maps__.getValue(MapName.ID_2_TAB, ret.id);
  }
  const results = [];
  for (const arg of args) {
    try {
      const ret = await Browser.getTabs().create(arg);
    // TODO: Get rid of sleep...
      await sleep(200);
      results.push(__maps__.getValue(MapName.ID_2_TAB, ret.id));
    } catch (e) {
      console.warn(e);
      continue;
    }
  }
  return results;
}
