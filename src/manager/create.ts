import { Browser } from "../api";
import { ITabMaps } from "../interfaces";
import { MapName } from "../maps/map-names";
import { sleep } from "../utils/process";

type Props = chrome.tabs.CreateProperties;

declare let __maps__: ITabMaps;

function prepareProps(candidate: unknown): Props | null {
  switch (typeof candidate) {
    case "number":
      return { index: candidate };
    case "string":
      if (+candidate) {
        return { index: +candidate };
      }
      try {
        new URL(candidate);
        return { url: candidate };
      } catch {
        return null;
      }
  }
  return candidate as Props;
}

export async function create(...props: Props[]) {
  if (!props?.length) {
    const ret = await Browser.getTabs().create({});
    await sleep(200);
    return __maps__.getValue(MapName.ID_2_TAB, ret.id);
  }
  if (props.length === 1) {
    const _props = prepareProps(props[0]);
    if (!_props) {
      console.warn("Invalid argument for TabsManager.create: " + props[0]);
      return;
    }
    const ret = await Browser.getTabs().create(_props);
    await sleep(200);
    return __maps__.getValue(MapName.ID_2_TAB, ret.id);
  }
  if (
    props.length === 2 &&
    typeof props[0] === "number" &&
    typeof props[1] === "string"
  ) {
    const ret = await Browser.getTabs().create({
      index: props[0],
      url: props[1],
    });
    await sleep(200);
    return __maps__.getValue(MapName.ID_2_TAB, ret.id);
  }
  const results = [];
  for (const item of props) {
    try {
      const _props = prepareProps(item);
      if (!_props) {
        console.warn("Invalid argument for TabsManager.create: " + item);
        continue;
      }
      const ret = await Browser.getTabs().create(_props);
      await sleep(200);
      results.push(__maps__.getValue(MapName.ID_2_TAB, ret.id));
    } catch (e) {
      console.warn(e);
      continue;
    }
  }
  return results;
}
