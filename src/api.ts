declare let browser: {
  tabs: typeof chrome.tabs;
  runtime: typeof chrome.runtime;
  scripting: typeof chrome.scripting;
  debugger: typeof chrome.debugger;
};

/**
 * Utility class for accessing browser APIs with support for fallback mechanisms.
 */
export class Browser {
  /**
   * Retrieves the `chrome.tabs` API or the equivalent `browser.tabs` API.
   *
   * @returns {typeof chrome.tabs | undefined} The tabs API object, or `undefined` if unavailable.
   */
  public static getTabs() {
    if (typeof chrome !== "undefined") {
      return chrome.tabs;
    }
    return browser?.tabs;
  }

  /**
   * Retrieves the `chrome.runtime` API or the equivalent `browser.runtime` API.
   *
   * @returns {typeof chrome.runtime | undefined} The runtime API object, or `undefined` if unavailable.
   */
  public static getRuntime() {
    if (typeof chrome !== "undefined") {
      return chrome.runtime;
    }
    return browser.runtime;
  }

  /**
   * Retrieves the `chrome.scripting` API or the equivalent `browser.scripting` API.
   * Warns if the required "scripting" permission is not granted.
   *
   * @returns {typeof chrome.scripting | null} The scripting API object, or `null` if unavailable or lacking permission.
   */
  public static getScripting() {
    if (!this.getRuntime().getManifest().permissions?.includes("scripting")) {
      console.warn("This runtime doesn't have required optional permission!");
      return null;
    }
    if (typeof chrome !== "undefined") {
      return chrome.scripting;
    }
    return browser.scripting;
  }

  /**
   * Retrieves the `chrome.debugger` API or the equivalent `browser.debugger` API.
   * Warns if the required "debugger" permission is not granted.
   *
   * @returns {typeof chrome.debugger | null} The debugger API object, or `null` if unavailable or lacking permission.
   */
  public static getDebugger(): typeof chrome.debugger | null {
    if (!this.getRuntime().getManifest().permissions?.includes("debugger")) {
      console.warn("This runtime doesn't have required optional permission!");
      return null;
    }

    if (typeof chrome !== "undefined") {
      return chrome.debugger;
    }
    return browser.debugger;
  }
}
