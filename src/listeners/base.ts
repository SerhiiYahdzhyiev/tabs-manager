import { debug } from "../utils/logging";

enum ListenerName {
  ACTIVATED = "activateListener",
  CREATED = "createListener",
  UPDATED = "updateListener",
  REMOVE = "removeListener",
  UPD_IDX = "updateIndexes",
  CLEAN_HOSTS = "cleanHostsMap",
}

function getPrefixStyles(name: ListenerName) {
  const colors = {
    // TODO: Refine colors...
    [ListenerName.ACTIVATED]: "darkorange",
    [ListenerName.CREATED]: "green",
    [ListenerName.UPDATED]: "yellow",
    [ListenerName.REMOVE]: "red",
    [ListenerName.UPD_IDX]: "cyan",
    [ListenerName.CLEAN_HOSTS]: "teal",
  };

  return `color:${colors[name] || "darkorange"};font-wieght:bold`;
}

export type TListenerFunction = typeof Function & {
  debug: (...args: unknown[]) => void;
};

export const ListenerFunction: TListenerFunction = Object.create(
  Function.prototype,
);

ListenerFunction.debug = function (...args: unknown[]) {
  const prefix = "%c[" + this.name + "]: ";
  const _args = [prefix, getPrefixStyles(this.name as ListenerName), ...args];
  debug(..._args);
};
