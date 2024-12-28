/**
 * Return passed string with a '/' in the end.
 *
 * @param {string} url - a url or any other string to add '/' to.
 *
 * @return {stirng} New string with a '/' at the end.
 * @throws {Error} On invalid input including empty strings.
 * @function
 */
export function ensureClosingSlash(url: string): string {
  if (typeof url !== "string" || !url.trim())
    throw new Error("Invalid input: " + url);
  const lastChar = url.split("").toReversed()[0];
  if (lastChar === "/") {
    return url;
  }
  return url + "/";
}
