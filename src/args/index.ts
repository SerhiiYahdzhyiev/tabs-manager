import { ManipulationName } from "../manipulations/names";

import create from "./create";

export function getPropsToArgs(name: ManipulationName) {
  switch (name) {
    case ManipulationName.CREATE:
      return create;
  }
}
