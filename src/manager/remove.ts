import updateIndexes from "../listeners/update-indexes";
import { ManipulationName } from "../manipulations/names";
import { TTab } from "../types";

type Target = string | number | TTab;
type TThis = { executeManipulation: CallableFunction };

export async function remove(this: TThis, ...target: Target[]) {
  const name = ManipulationName.REMOVE;
  const updIdx = updateIndexes.bind(this);

  if (target.length === 1) {
    if (typeof target[0] === "string" && !+target[0]) {
      throw new Error("Invalid taret for TabsManager.remove: " + target[0]);
    }
    await updIdx();
    return await this.executeManipulation(name, target[0]);
  }

  const results = [];
  for (const item of target) {
    if (typeof target[0] === "string" && !+target[0]) {
      console.warn(
        "Invalid taret for TabsManager.remove: " + target[0] + " ! Skipping...",
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
  await updIdx();
  return results;
}
