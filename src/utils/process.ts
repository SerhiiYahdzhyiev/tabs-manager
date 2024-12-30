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
