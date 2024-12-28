//@ts-nocheck
import { describe, test, expect } from "vitest";

import {
  withError,
} from "../src/utils/process";

import {
  ensureClosingSlash,
} from "../src/utils/string";

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

describe("withError", () => {
  test("retruns callable function", () => {
    const cb = (a, b) => {
      return a + b;
    }

    const func = withError(cb);

    expect(func).toBeInstanceOf(Function);
  });

  test("returned callable function returns a tuple", async () => {
    const cb = (a, b) => {
      return a + b;
    }

    const func = withError(cb);

    expect(await func(2, 2)).toBeInstanceOf(Array);
    await expect((await func(2, 2)).length).toBe(2);
  });

  test("returned callable function returns error null if wrapped function executes with no errors", async () => {
    const res = await withError((a,b) => a + b)(2, 2);

    expect(res).toBeInstanceOf(Array);
    expect(res.length).toBe(2);
    expect(res[0]).toBe(null);
  });

  test("returned callable function returns error if wrapped function throws", async () => {
    const res = await withError(() => {throw new TypeError("42")})();

    expect(res).toBeInstanceOf(Array);
    expect(res.length).toBe(2);
    expect(res[0]).not.toBe(null);
    expect(res[0]).toBeInstanceOf(Object);
    expect(String(res[0].message)).toBe("TypeError: 42");
  });
  test("returned callable function returns result if wrapped function returns something", async () => {
    const res = await withError((a,b) => a + b)(2, 2);

    expect(res).toBeInstanceOf(Array);
    expect(res.length).toBe(2);
    expect(res[1]).toBe(4);
  });
});
