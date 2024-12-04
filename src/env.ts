import { EnvironmentType } from "./types";

declare let browser: {
  tabs: typeof chrome.tabs;
};

/**
 * Utility class for determining and validating the current environment type.
 */
export class Environment {
  /**
   * Detects the type of the current execution environment.
   *
   * @returns {EnvironmentType} One of "worker", "window", or "invalid".
   */
  public static getEnvType(): EnvironmentType {
    const globalThisString = String(globalThis);

    if (/worker/i.test(globalThisString)) {
      return EnvironmentType.WORKER;
    }

    if (/window/i.test(globalThisString)) {
      return EnvironmentType.WINDOW;
    }

    console.warn("Environment detection failed! Defaulting to 'invalid'.");
    return EnvironmentType.INVALID;
  }

  /**
   * Verifies if the current environment is suitable for TabsManager library.
   *
   * @param {EnvironmentType} type - The expected environment type ("worker" or "window").
   * @returns {boolean} `true` if the current environment is suitable; otherwise, `false`.
   */
  public static assertEnv(type: EnvironmentType): boolean {
    switch (type) {
      case EnvironmentType.WINDOW:
        // Check for a browser tabs API presence in a window context.
        return (
          (typeof browser !== "undefined" && browser.tabs !== undefined) ||
          (typeof chrome !== "undefined" && chrome.tabs !== undefined)
        );
      case EnvironmentType.WORKER:
        // Validate worker-specific environment presence.
        return (
          (typeof browser !== "undefined" && browser.tabs !== undefined) ||
          (typeof chrome !== "undefined" && chrome.tabs !== undefined)
        );
      default:
        console.warn(`Unknown environment type: ${type}`);
        return false;
    }
  }
}
