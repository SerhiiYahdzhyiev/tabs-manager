import discard from "./discard";
import connect from "./connect";
import { ManipulationName } from "./names";

export const manipulations = new Map([
  [ManipulationName.DISCARD, discard],
  [ManipulationName.CONNECT, connect],
]);
