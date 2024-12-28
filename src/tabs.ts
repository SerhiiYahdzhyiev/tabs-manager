import { Tab } from "./tab";
import { ITabMaps } from "./interfaces";

declare const __maps__: ITabMaps;

export class Tabs {
  public getTabById(id: number): Tab | null {
    return __maps__.getValue("idToTab", id) || null;
  }

  public getTabsByUrl(url: string): Tab[] {
    try {
      new URL(url);
    } catch {
      console.warn("Invalid url: " + url);
      return [];
    }
    const ids = __maps__.getValue<string, number[]>("urlToIds", url);
    if (ids && ids.length) {
      const result: Tab[] = [];
      for (const id of ids) {
        result.push(this.getTabById(id)!);
      }
      return result;
    }
    return [];
  }

  public getIdsBy(url: string): number[] {
    return __maps__.getValue("urlToIds", url) || [];
  }

  public get(key: string | number): Tab | Tab[] | null {
    if (typeof key === "number") {
      return this.getTabById(key);
    }
    if (typeof key === "string") {
      let candidate: Tab | Tab[] | null = null;
      if (!isNaN(+key) && +key > 0) {
        candidate = this.getTabById(+key);
      }
      if (!candidate) {
        candidate = this.getTabsByUrl(key);
      }
      return candidate;
    }
    return null;
  }

  public hasId(id: number) {
    return __maps__.hasKey("idToTab", id);
  }

  public hasUrl(url: string) {
    try {
      new URL(url);
    } catch {
      console.warn("Invalid url: " + url);
      return false;
    }
    return __maps__.hasKey("urlToIds", url);
  }

  public has(key: string | number): boolean {
    if (typeof key === "number") {
      return __maps__.hasKey("idToTab", key);
    }
    if (typeof key === "string") {
      let a: boolean = false;
      if (!isNaN(+key) && +key > 0) {
        a = __maps__.hasKey("idToTab", +key);
      }
      const b = this.hasUrl(key);
      return a || b;
    }
    return false;
  }

  public discard(oldId: number, newId: number) {
    // TODO: Refactor?..
    const tab = __maps__.getValue<number, Tab>("idToTab", oldId)!;
    __maps__.updateMap("idToTab", oldId, null);
    __maps__.updateMap("idToTab", newId, tab);
    __maps__.updateMap("urlToIds", tab.url, oldId);
    __maps__.updateMap("urlToIds", tab.url, newId);
    if (tab.urlObj?.host)
      __maps__.updateMap("hostToIds", tab.urlObj?.host, oldId);
    if (tab.urlObj?.host)
      __maps__.updateMap("hostToIds", tab.urlObj?.host, newId);
  }
}
