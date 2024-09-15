export function ensureClosingSlash(url: string): string {
  const lastChar = url.split("").toReversed()[0];
  if (lastChar === "/") {
    return url;
  }
  return url + "/";
}
