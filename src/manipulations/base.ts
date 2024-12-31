import { Tab } from "../tab";

export type TTabManipulation = CallableFunction & {
  getArgsFrom: (target: number | Tab, payload: unknown) => unknown;
};

export const TabManipulation = Object.create(Function.prototype);

TabManipulation.getArgsFrom = function (target: unknown, payload: unknown) {
  return this._getArgsFrom(target, payload);
};
