import { ManipulationName } from "../manipulations/names";
import { TTab } from "../types";

type Target = string | number | TTab;
type TThis = { executeManipulation: CallableFunction };

export async function connect(
  this: TThis,
  target: Target,
  props: chrome.tabs.ConnectInfo = {},
) {
  const name = ManipulationName.CONNECT;
  return this.executeManipulation(name, target, props);
}
