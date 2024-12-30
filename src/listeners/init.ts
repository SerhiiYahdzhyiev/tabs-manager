import { Browser } from "../api";
import { debug } from "../utils/logging";

import activate from "./activate";
import create from "./create";
import remove from "./remove";
import update from "./update";

import checkHostsMap from "./clean-hosts-map";
import updateIndexes from "./update-indexes";

export function initListeners() {
  debug("Initializing listeners...");
  const tabs = Browser.getTabs();

  tabs.onActivated.addListener(activate);

  tabs.onUpdated.addListener(checkHostsMap);
  tabs.onUpdated.addListener(update);

  tabs.onCreated.addListener(create);
  tabs.onCreated.addListener(updateIndexes);

  tabs.onRemoved.addListener(checkHostsMap);
  tabs.onRemoved.addListener(remove);
  tabs.onRemoved.addListener(updateIndexes);

  tabs.onMoved.addListener(updateIndexes);
}
