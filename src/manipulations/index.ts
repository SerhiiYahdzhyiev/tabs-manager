import discard from "./discard";
import connect from "./connect";
import remove from "./remove";
import { ManipulationName } from "./names";

export const manipulations = new Map([
  [ManipulationName.DISCARD, discard],
  [ManipulationName.CONNECT, connect],
  [ManipulationName.REMOVE, remove],
]);
