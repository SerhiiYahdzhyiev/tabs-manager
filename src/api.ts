declare let browser: {
  tabs: typeof chrome.tabs;
  runtime: typeof chrome.runtime;
  scripting: typeof chrome.scripting;
  debugger: typeof chrome.debugger;
};

export class Browser {
  public static getTabs() {
    if (typeof chrome !== "undefined") {
      return chrome.tabs;
    }
    return browser?.tabs;
  }

  public static getRuntime() {
    if (typeof chrome !== "undefined") {
      return chrome.runtime;
    }
    return browser.runtime;
  }

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
