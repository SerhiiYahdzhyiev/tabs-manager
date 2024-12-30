//@ts-nocheck
import { describe, test, expect } from "vitest";

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
