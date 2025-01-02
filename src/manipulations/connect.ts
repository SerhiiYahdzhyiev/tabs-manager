import { Browser } from "../api";
import { TabManipulation, TTabManipulation } from "./base";
import { TTab } from "../types";
import { isFirefox, sleep } from "../utils/process";

async function connect(
  this: TTabManipulation,
  tabId: number,
  props: chrome.tabs.ConnectInfo,
) {
  const port = Browser.getTabs().connect(tabId, props);
  // TODO: Fix error handling in chrome...
  await sleep(100);
  const errorCandidate = Browser.getRuntime().lastError;
  if (errorCandidate) throw errorCandidate;
  if (isFirefox() && (port as unknown as { error: string }).error) {
    throw new Error((port as unknown as { error: string }).error);
  }
  return port;
}

Object.setPrototypeOf(connect, TabManipulation);

connect._getArgsFrom = function (
  target: number | string | TTab,
  props: chrome.tabs.ConnectInfo = {},
): [number, chrome.tabs.ConnectInfo] {
  return typeof (target as TTab).id !== "undefined"
    ? [(target as TTab).id!, props]
    : [+(target as number), props];
};

export default connect as unknown as TTabManipulation;
