import { ITabMaps } from "../interfaces";
import { ListenerFunction, TListenerFunction } from "./base";

declare const __maps__: ITabMaps;

export function checkHostsMap(this: TListenerFunction) {
  for (const [k, ids] of __maps__.entries<string, number[]>("hostToIds")) {
    if (!ids.length) {
      this.debug("Deleting ", k);
      __maps__.updateMap("hostToIds", k, null);
    }
  }
}

Object.setPrototypeOf(checkHostsMap, ListenerFunction);

export default checkHostsMap.bind(
  checkHostsMap as unknown as TListenerFunction,
);
