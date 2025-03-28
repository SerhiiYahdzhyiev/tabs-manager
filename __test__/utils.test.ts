//@ts-nocheck
import { describe, test, expect } from "vitest";

import { ensureClosingSlash } from "../src/utils/string";

import { url, URLConstructionError } from "../src/utils/url";

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
    expect(ensureClosingSlash("http://noclosing.com")).toBe(
      "http://noclosing.com/",
    );
    expect(ensureClosingSlash("42")).toBe("42/");
  });
});

describe("url", () => {
  test("should return URL instance on valid payload", () => {
    let source = "http://localhost";

    expect(url(source)).toBeInstanceOf(URL);
    expect(url(source).protocol).toBe("http:");
    expect(url(source).host).toBe("localhost");
    expect(url(source).hostname).toBe("localhost");
    expect(url(source).searchParams).toBeInstanceOf(URLSearchParams);

    source = "https://pfct.net:7000/api?a=42&foo=bar";

    expect(url(source)).toBeInstanceOf(URL);
    expect(url(source).protocol).toBe("https:");
    expect(url(source).host).toBe("pfct.net:7000");
    expect(url(source).hostname).toBe("pfct.net");
    expect(+url(source).port).toBe(7000);
    expect(url(source).searchParams.get("a")).toBeTruthy();
    expect(url(source).searchParams.get("foo")).toBe("bar");
  });

  test("should throw custom error on invalid payload", () => {
    expect(() => url("")).toThrow();
    expect(() => url("invalid")).toThrow();
    expect(() => url(null)).toThrow();
    expect(() => url(undefined)).toThrow();
    expect(() => url(2)).toThrow();
    expect(() => url(NaN)).toThrow();
    expect(() => url([])).toThrow();
    expect(() => url({})).toThrow();
  });
});
