import { ManipulationName } from "../manipulations/names";

import create from "./create";

export function getArgs(name: ManipulationName, ...props: unknown[]) {
  switch (name) {
    case ManipulationName.CREATE:
      return create(...props);
  }
}
