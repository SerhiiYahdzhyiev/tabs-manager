declare let browser: {
  tabs: typeof chrome.tabs;
  runtime: typeof chrome.runtime;
  scripting: typeof chrome.scripting;
  debugger: typeof chrome.debugger;
  windows: typeof chrome.windows;
};

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

export function getWindows(): typeof chrome.windows | null {
  if (typeof chrome !== "undefined") {
    return chrome.windows;
  }
  return browser.windows;
}
