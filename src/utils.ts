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

/**
 * Wrap a function into try-catch-finally block.
 * Returns new async function that returns a tuple of [error, result].
 *
 * @param {CallableFunction} cb - a callback to wrap.
 *
 * @return {CallableFunction} Wrapped function (...args:any[]) => Promis<[any, any]>.
 * @function
 */
export function withError(cb: CallableFunction): CallableFunction {
  return async (...args: unknown[]) => {
    let error = null;
    let result;
    try {
      result = await cb(...args);
    } catch (e: unknown) {
      error = {
        message: String(e),
        stack: new Error().stack,
      };
    } finally {
      return [error, result];
    }
  };
}

/**
 * Check if the library runs in Firefox browser.
 *
 * @return {boolean} Indicating if the library runs in Firefox.
 * @function
 */
export function isFirefox() {
  // INFO: This disabled way is more reliable and spoofprove,
  //       but deprecated...
  // return typeof InstallTrigger !== "undefined";
  return navigator.userAgent.includes("Firefox");
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
