import { Tab } from "../tab";
import { ITabMaps } from "../interfaces";
import { ListenerFunction, TListenerFunction } from "./base";

import { sleep } from "../utils/process";

declare const __maps__: ITabMaps;
declare let _activeId: number;
declare let __tabs__: Tab[];
declare let _idxUpdateLock: number;

async function activatedListener(
  this: TListenerFunction,
  info: chrome.tabs.TabActiveInfo,
) {
  this.debug("Updating active tab...");

  while (_idxUpdateLock > 0) {
    this.debug("Waiting for indexes update lock release...");
    await sleep(100);
  }

  this.debug("Current activateId: " + _activeId);
  this.debug("Tab Active info: ");
  this.debug(info);
  if (_activeId && _activeId !== info.tabId) {
    const tab = __maps__.getValue<number, Tab>("idToTab", _activeId);
    if (tab) {
      this.debug("Tab:");
      this.debug(tab);
      this.debug("__tabs__[tab.index]:");
      this.debug(__tabs__[tab.index]);
      __tabs__[tab.index].active = tab.active = false;
    }
  }
  _activeId = info.tabId;
  // TODO: Add ability to configure this behaviour
  const window = await chrome.windows.get(info.windowId);
  if (window.focused) {
    const tab = __maps__.getValue<number, Tab>("idToTab", info.tabId);
    if (tab) {
      this.debug("Tab:");
      this.debug(tab);
      this.debug("__tabs__[tab.index]:");
      this.debug(__tabs__[tab.index]);
      __tabs__[tab.index].active = tab.active = true;
    }
  }
}

Object.setPrototypeOf(activatedListener, ListenerFunction);

export default activatedListener.bind(
  activatedListener as unknown as TListenerFunction,
);
