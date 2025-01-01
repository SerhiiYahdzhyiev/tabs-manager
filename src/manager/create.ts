import { Browser } from "../api";
import { ITabMaps } from "../interfaces";
import { MapName } from "../maps/map-names";
import { sleep } from "../utils/process";

type Props = chrome.tabs.CreateProperties;

declare let __maps__: ITabMaps;

export async function create(...props: Props[]) {
  if (!props?.length) {
    const ret = await Browser.getTabs().create({});
    await sleep(200);
    return __maps__.getValue(MapName.ID_2_TAB, ret.id);
  }
  if (props.length === 1) {
    const ret = await Browser.getTabs().create(props[0]);
    await sleep(200);
    return __maps__.getValue(MapName.ID_2_TAB, ret.id);
  }
  const results = [];
  for (const item of props) {
    try {
      const ret = await Browser.getTabs().create(item);
      await sleep(200);
      results.push(__maps__.getValue(MapName.ID_2_TAB, ret.id));
    } catch (e) {
      console.warn(e);
      continue;
    }
  }
  return results;
}
