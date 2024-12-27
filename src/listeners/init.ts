import { Browser } from "../api";
import { debug } from "../utils/logging";

import activate from "./activate";
import create from "./create";
import remove from "./remove";

import updateIndexes from "./update-indexes";

export function initListeners() {
  debug("Initializing listeners...");
  const tabs = Browser.getTabs();

  tabs.onActivated.addListener(activate);

  tabs.onCreated.addListener(create);
  tabs.onCreated.addListener(updateIndexes);

  tabs.onRemoved.addListener(remove);
  tabs.onRemoved.addListener(updateIndexes);
}
