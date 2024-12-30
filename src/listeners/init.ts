import { Browser } from "../api";
import { debug } from "../utils/logging";

import activate from "./activate";
import create from "./create";
import remove from "./remove";
import update from "./update";

import cleanHostsMap from "./clean-hosts-map";
import updateIndexes from "./update-indexes";

export function initListeners() {
  debug("Initializing listeners...");
  const tabs = Browser.getTabs();

  tabs.onActivated.addListener(activate);

  tabs.onUpdated.addListener(update);
  tabs.onUpdated.addListener(cleanHostsMap);

  tabs.onCreated.addListener(create);
  tabs.onCreated.addListener(updateIndexes);

  tabs.onRemoved.addListener(remove);
  tabs.onRemoved.addListener(updateIndexes);
  tabs.onRemoved.addListener(cleanHostsMap);

  tabs.onMoved.addListener(updateIndexes);
}
