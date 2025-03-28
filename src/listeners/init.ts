import { Browser } from "../api";
import { debug } from "../utils/logging";

import activate from "./activate";
import create from "./create";
import remove from "./remove";
import update from "./update";

import cleanUrlMaps from "./clean-url-maps";
import updateIndexes from "./update-indexes";

export function initListeners() {
  debug("Initializing listeners...");
  const tabs = Browser.getTabs();

  tabs.onActivated.addListener(activate);

  tabs.onUpdated.addListener(update);
  tabs.onUpdated.addListener(cleanUrlMaps);

  tabs.onCreated.addListener(create);

  tabs.onRemoved.addListener(remove);
  tabs.onRemoved.addListener(cleanUrlMaps);

  tabs.onMoved.addListener(updateIndexes);
}
