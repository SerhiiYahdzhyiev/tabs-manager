import { ITabMaps } from "../interfaces";
import { urlKeys } from "../maps/url-keys";
import { ListenerFunction, TListenerFunction } from "./base";

declare const __maps__: ITabMaps;

export function cleanUrlMaps(this: TListenerFunction) {
  // TODO: Test performance implications,
  //       think of more optimal way to do this
  for (const urlKey of urlKeys) {
    for (const [key, ids] of __maps__.entries<string, number[]>(urlKey)) {
      if (!ids.length) {
        this.debug("Deleting ", key);
        __maps__.updateMap(urlKey, key, null);
      }
    }
  }
}

Object.setPrototypeOf(cleanUrlMaps, ListenerFunction);

export default cleanUrlMaps.bind(cleanUrlMaps as unknown as TListenerFunction);
