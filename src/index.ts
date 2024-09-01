"use strict";

enum EnvironmentType {
    WINDOW="window",
    WORKER="worker",
    INVALID="invalid",
};

function getEnvType(): EnvironmentType {
    const gThis = String(globalThis);
    if (gThis.match(/worker/ig)) {
        return EnvironmentType.WORKER
    } else if (gThis.match(/window/ig)) {
        return EnvironmentType.WINDOW
    }
    console.warn("Environment detection failed!");
    return EnvironmentType.INVALID
}

function assertEnv(type: EnvironmentType): boolean {
    switch(type) {
        case EnvironmentType.WINDOW:
            return !!(
                //@ts-ignore
                (browser && browser.tabs) ||
                (chrome && chrome.tabs)
        );
        case EnvironmentType.WORKER:
            return !!(
                (chrome && chrome.tabs) ||
                //@ts-ignore
                (browser && browser.tabs)
        );
    }
    return false;
}

function getTabs() {
    if (typeof chrome !== "undefined") {
        return chrome.tabs;
    }
    //@ts-ignore
    return browser?.tabs;
}

if (!assertEnv(getEnvType())) {
    console.warn("This environment is not suitable for TabsManager!");
}

// INFO: Globals
var envType: EnvironmentType = getEnvType();
var _oldTabs = getOldTabs();
// =============
