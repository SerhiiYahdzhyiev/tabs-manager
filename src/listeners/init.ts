import { Browser } from "../api";
import { debug } from "../utils/logging";
import createListener from "./create";

export function initListeners() {
  debug("Initializing listeners...");
  const tabs = Browser.getTabs();

  tabs.onCreated.addListener(createListener);

  Object.assign(globalThis, { createListener });
}
