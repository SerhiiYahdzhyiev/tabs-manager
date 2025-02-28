export type TWrappersMap = Map<
  number,
  Map<
    string,
    CallableFunction
    // TODO: Improve wrapper functions typing
    // (...args: unknown[]) => Record<string, number | string>
  >
>;

function echo(...args: any) {
  return args;
}

export function getTypes(...args: unknown[]): string {
  let res = "";
  for (let i = 0; i < args.length; i++) {
    res += typeof args[i];
  }
  return res;
}

export function getWrapper(
  wrappers: TWrappersMap,
  length: number,
  types: string,
) {
  if (!length) {
    throw new Error("Invalid length for args wrapper: " + length + " !");
  }

  const candidate = wrappers.get(length)?.get(types);

  return candidate || echo;
}
