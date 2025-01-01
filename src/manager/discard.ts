import { ManipulationName } from "../manipulations/names";
import { TTab } from "../types";

type Target = string | number | TTab;
type TThis = { executeManipulation: CallableFunction };

export async function discard(this: TThis, ...target: Target[]) {
  const name = ManipulationName.DISCARD;
  if (target.length === 1) {
    if (typeof target[0] === "string" && !+target[0]) {
      throw new Error("Invalid taret for TabsManager.discard: " + target[0]);
    }
    return await this.executeManipulation(name, target[0]);
  }
  const results = [];
  for (const item of target) {
    if (typeof target[0] === "string" && !+target[0]) {
      console.warn(
        "Invalid taret for TabsManager.discard: " +
          target[0] +
          " ! Skipping...",
      );
      continue;
    }
    try {
      const ret = await this.executeManipulation(name, item);
      results.push(ret);
    } catch (e) {
      console.warn(e);
    }
  }
  return results;
}
