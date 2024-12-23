import { TabMaps } from "./tab-maps";

export function initMaps() {
  Object.assign(globalThis, { __maps__: new TabMaps() });
}
