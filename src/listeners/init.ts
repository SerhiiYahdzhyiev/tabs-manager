import { Browser } from "../api";
import { debug } from "../utils/logging";

import activate from "./activate";
import create from "./create";
import remove from "./remove";

import updateIndexes from "./update-indexes";
import checkHostsMap from "./check-hosts-map";

export function initListeners() {
  debug("Initializing listeners...");
  const tabs = Browser.getTabs();

  tabs.onActivated.addListener(activate);

  tabs.onUpdated.addListener(checkHostsMap);

  tabs.onCreated.addListener(create);
  tabs.onCreated.addListener(updateIndexes);

  tabs.onRemoved.addListener(checkHostsMap);
  tabs.onRemoved.addListener(remove);
  tabs.onRemoved.addListener(updateIndexes);

  tabs.onMoved.addListener(updateIndexes);
}
