//@ts-nocheck
import { describe, test, expect } from "vitest";

import {
  ensureClosingSlash,
  simpleOneToOneMapUpdater,
  stringToIdsMapUpdater,
  withError,
} from "../src/utils";

describe("ensureClosingSlash", () => {
  test("throws on invalid input", () => {
    expect(() => ensureClosingSlash({})).toThrow();
    expect(() => ensureClosingSlash(null)).toThrow();
    expect(() => ensureClosingSlash(undefined)).toThrow();
    expect(() => ensureClosingSlash([])).toThrow();
    expect(() => ensureClosingSlash(NaN)).toThrow();
    expect(() => ensureClosingSlash(0)).toThrow();
    expect(() => ensureClosingSlash(42)).toThrow();
    expect(() => ensureClosingSlash("")).toThrow();
  });
  test("adds enclosing slash to valid input", () => {
    expect(ensureClosingSlash("http://noclosing.com")).toBe("http://noclosing.com/");
    expect(ensureClosingSlash("42")).toBe("42/");
  });
});

describe("simpleOneToneMapUpdater", () => {
  test("correctly adds new entry to the map", () => {
    const map = new Map<string, number>();

    expect(map.size).toBe(0);

    simpleOneToOneMapUpdater<Map<string, number>, string, number>(map, "1", 1);

    expect(map.size).toBe(1);
    expect(map.has("1")).toBe(true);
    expect(map.get("1")).toBe(1);
  });
  test("correctly updates entry of the map", () =>{
    const map = new Map<string, number>([
      ["1", 1],
    ]);

    expect(map.size).toBe(1);
    expect(map.has("1")).toBe(true);
    expect(map.get("1")).toBe(1);

    simpleOneToOneMapUpdater<Map<string, number>, string, number>(map, "1", 2);

    expect(map.size).toBe(1);
    expect(map.has("1")).toBe(true);
    expect(map.get("1")).toBe(2);
  });
  test("correctly removes entry to the map", () =>{
    const map = new Map<string, number>([
      ["1", 1],
    ]);

    expect(map.size).toBe(1);
    expect(map.has("1")).toBe(true);
    expect(map.get("1")).toBe(1);

    simpleOneToOneMapUpdater<Map<string, number>, string, number>(map, "1", null);

    expect(map.size).toBe(0);
    expect(map.has("1")).toBe(false);
  });
});

describe("stringToIdsMapUpdater", () => {
  test("correctly adds new entry to the map", () =>{
    const map = new Map<stirng, numner[]>();

    expect(map.size).toBe(0);

    stringToIdsMapUpdater(map, "1", 1);

    expect(map.size).toBe(1);
    expect(map.has("1")).toBe(true);
    expect(map.get("1")).toBeInstanceOf(Array);
    expect(map.get("1")[0]).toBe(1);
  });

  test("correctly updates entry of the map", () =>{
    const map = new Map<stirng, numner[]>([
      ["1", [1,2,3]]
    ]);

    expect(map.size).toBe(1);
    expect(map.has("1")).toBe(true);
    expect(map.get("1")).toBeInstanceOf(Array);
    expect(map.get("1").length).toBe(3);

    stringToIdsMapUpdater(map, "1", 4);

    expect(map.size).toBe(1);
    expect(map.has("1")).toBe(true);
    expect(map.get("1")).toBeInstanceOf(Array);
    expect(map.get("1").length).toBe(4);
    expect(map.get("1")[3]).toBe(4);
  });

  test("correctly removes id entry from the map entry value", () =>{
    const map = new Map<stirng, numner[]>([
      ["1", [1,2,3]]
    ]);

    expect(map.size).toBe(1);
    expect(map.has("1")).toBe(true);
    expect(map.get("1")).toBeInstanceOf(Array);
    expect(map.get("1").length).toBe(3);

    stringToIdsMapUpdater(map, "1", 1);

    expect(map.size).toBe(1);
    expect(map.has("1")).toBe(true);
    expect(map.get("1")).toBeInstanceOf(Array);
    expect(map.get("1").length).toBe(2);
    expect(map.get("1")[0]).toBe(2);
  });
});

describe("withError", () => {
  test("retruns callable function", () => {
    const cb = (a, b) => {
      return a + b;
    }

    const func = withError(cb);

    expect(func).toBeInstanceOf(Function);
  });

  test("returned callable function returns a tuple", () => {
    const cb = (a, b) => {
      return a + b;
    }

    const func = withError(cb);

    expect(() => func(2, 2)).toBeInstanceOf(Array);
    expect((() => func(2, 2)).length).toBe(2);
  });

  test("returned callable function returns error null if wrapped function executes with no errors", () => {
    const res = withError((a,b) => a + b)(2, 2);

    expect(res).toBeInstanceOf(Array);
    expect(res.length).toBe(2);
    expect(res[0]).toBe(null);
  });

  test("returned callable function returns error if wrapped function throws", () => {
    const res = withError(() => {throw new TypeError("42")})();

    expect(res).toBeInstanceOf(Array);
    expect(res.length).toBe(2);
    expect(res[0]).not.toBe(null);
    expect(res[0]).toBeInstanceOf(Error);
    expect(String(res[0])).toBe("42");
  });
  test("returned callable function returns result if wrapped function returns something", () => {
    const res = withError((a,b) => a + b)(2, 2);

    expect(res).toBeInstanceOf(Array);
    expect(res.length).toBe(2);
    expect(res[1]).toBe(4);
  });
});
