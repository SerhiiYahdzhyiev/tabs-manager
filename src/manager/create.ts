import { Browser } from "../api";
import { getArgs } from "../args/index";

import { ManipulationName } from "../manipulations/names";
import { MapName } from "../maps/map-names";

import { sleep } from "../utils/process";

type Props = chrome.tabs.CreateProperties;

export async function create(...props: Props[]) {
  let ret;
  if (!props?.length) {
    ret = await Browser.getTabs().create({});
    // TODO: Get rid of sleep...
    await sleep(200);
    //@ts-expect-error INFO: this -> TabsManager instance
    return this._maps.getValue(MapName.ID_2_TAB, ret.id);
  }
  const args = getArgs(ManipulationName.CREATE, ...props)!;

  if (!(args instanceof Array)) {
    ret = await Browser.getTabs().create(args);
    // TODO: Get rid of sleep...
    await sleep(200);
    //@ts-expect-error INFO: this -> TabsManager instance
    return this._maps.getValue(MapName.ID_2_TAB, ret.id);
  }
  const results = [];
  for (const arg of args) {
    try {
      const ret = await Browser.getTabs().create(arg);
      // TODO: Get rid of sleep...
      await sleep(200);
      //@ts-expect-error INFO: this -> TabsManager instance
      results.push(this._maps.getValue(MapName.ID_2_TAB, ret.id));
    } catch (e) {
      console.warn(e);
      continue;
    }
  }
  return results;
}
