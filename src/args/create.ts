import { getTypes, getWrapper, TWrappersMap } from "./base";

const createWrappersMap: TWrappersMap = new Map([
  [
    1,
    new Map<string, CallableFunction>([
      ["number", (index: number) => ({ index })],
      [
        "string",
        (v: string) => {
          if (+(v as string)) {
            return { index: +(v as string) };
          }
          return { url: v };
        },
      ],
      ["boolean", (active: boolean) => ({ active })],
    ]),
  ],
  [
    2,
    new Map<string, CallableFunction>([
      ["numberstring", (index: number, url: string) => ({ index, url })],
      // TODO: Fix potential 0 or negative count
      [
        "stringnumber",
        (url: string, count: number) => new Array(count).fill({ url }),
      ],
      [
        "numberboolean",
        (index: number, active: boolean) => ({ index, active }),
      ],
      [
        "booleannumber",
        (active: boolean, index: number) => ({ index, active }),
      ],
      ["stringboolean", (url: string, active: boolean) => ({ url, active })],
      ["booleanstring", (active: boolean, url: boolean) => ({ url, active })],
    ]),
  ],
]);

export default function (...props: unknown[]) {
  const length = props.length;
  const types = getTypes(...props);

  const wrapper = getWrapper(createWrappersMap, length, types);

  return wrapper(...props);
}
