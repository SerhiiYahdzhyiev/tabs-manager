import { debug } from "../utils/logging";

export type TListenerFunction = typeof Function & {
  debug: (...args: unknown[]) => void;
};

export const ListenerFunction: TListenerFunction = Object.create(
  Function.prototype,
);

ListenerFunction.debug = function (...args: unknown[]) {
  const _args = [`[${this.name}]: `, ...args];
  debug(..._args);
};
