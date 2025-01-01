export type TTabManipulation = CallableFunction & {
  getArgsFrom: (target: unknown, payload: unknown) => unknown;
};

export const TabManipulation = Object.create(Function.prototype);

TabManipulation.getArgsFrom = function (target: unknown, payload: unknown) {
  return this._getArgsFrom(target, payload);
};
