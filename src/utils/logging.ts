declare let __debug__: boolean;

export function debug(...args: unknown[]) {
  if (!__debug__) return;
  console.log(...args);
}
