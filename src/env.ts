import { EnvironmentType } from "./types";

declare let browser: {
  tabs: typeof chrome.tabs;
  runtime: typeof chrome.runtime;
};

export function getEnvType(): EnvironmentType {
  const gThis = String(globalThis);
  if (gThis.match(/worker/gi)) {
    return EnvironmentType.WORKER;
  } else if (gThis.match(/window/gi)) {
    return EnvironmentType.WINDOW;
  }
  console.warn("Environment detection failed!");
  return EnvironmentType.INVALID;
}

export function assertEnv(type: EnvironmentType): boolean {
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
