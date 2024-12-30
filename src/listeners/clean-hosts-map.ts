import { ITabMaps } from "../interfaces";
import { ListenerFunction, TListenerFunction } from "./base";

declare const __maps__: ITabMaps;

export function cleanHostsMap(this: TListenerFunction) {
  for (const [k, ids] of __maps__.entries<string, number[]>("hostToIds")) {
    if (!ids.length) {
      this.debug("Deleting ", k);
      __maps__.updateMap("hostToIds", k, null);
    }
  }
}

Object.setPrototypeOf(cleanHostsMap, ListenerFunction);

export default cleanHostsMap.bind(
  cleanHostsMap as unknown as TListenerFunction,
);
