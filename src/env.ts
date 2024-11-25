import { EnvironmentType } from "./types";

declare let browser: {
  tabs: typeof chrome.tabs;
  runtime: typeof chrome.runtime;
  scripting: typeof chrome.scripting;
  debugger: typeof chrome.debugger;
};

export class Environment {
  /**
   * Return the type of environment.
   *
   * @returns {EnvironmentType} "worker" | "window" | "invalid"
   */
  public static getEnvType(): EnvironmentType {
    const gThis = String(globalThis);
    if (gThis.match(/worker/gi)) {
      return EnvironmentType.WORKER;
    } else if (gThis.match(/window/gi)) {
      return EnvironmentType.WINDOW;
    }
    console.warn("Environment detection failed!");
    return EnvironmentType.INVALID;
  }
  /**
 * Check if the current environment matches the specified type.
 *
 * @param {EnvironmentType} type - The expected environment type ("worker" or
 * "window").
 * @returns {boolean} `true` if the environment matches the specified type,
 * otherwise `false`.
 */
  public static assertEnv(type: EnvironmentType): boolean {
    switch (type) {
      case EnvironmentType.WINDOW:
        return !!(
          (typeof browser !== "undefined" && browser.tabs) ||
          (globalThis.chrome && chrome.tabs)
        );
      case EnvironmentType.WORKER:
        return !!((chrome && chrome.tabs) || (browser && browser.tabs));
    }
    return false;
  }
}


export function getTabs() {
  if (typeof chrome !== "undefined") {
    return chrome.tabs;
  }
  return browser?.tabs;
}

export function getRuntime() {
  if (typeof chrome !== "undefined") {
    return chrome.runtime;
  }
  return browser.runtime;
}

export function getScripting() {
  if (!getRuntime().getManifest().permissions?.includes("scripting")) {
    console.warn("This runtime doesn't have required optional permission!");
    return null;
  }
  if (typeof chrome !== "undefined") {
    return chrome.scripting;
  }
  return browser.scripting;
}

export function getDebugger(): typeof chrome.debugger | null {
  if (!getRuntime().getManifest().permissions?.includes("debugger")) {
    console.warn("This runtime doesn't have required optional permission!");
    return null;
  }

  if (typeof chrome !== "undefined") {
    return chrome.debugger;
  }
  return browser.debugger;
}
