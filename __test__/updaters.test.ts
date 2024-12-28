//@ts-nocheck
import { describe, test, expect } from "vitest";

import {
  simpleOneToOneMapUpdater,
  stringToIdsMapUpdater,
} from "../src/maps/updaters";

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
