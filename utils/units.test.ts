import { describe, test, expect } from "@jest/globals";
import { areUnitsCompatible, convertUnit } from "./units";

describe("areUnitsCompatible", () => {
  test("ml and l are compatible (same volume group)", () => {
    expect(areUnitsCompatible("ml", "l")).toBe(true);
  });

  test("l and ml are compatible (symmetric)", () => {
    expect(areUnitsCompatible("l", "ml")).toBe(true);
  });

  test("g and kg are compatible (same weight group)", () => {
    expect(areUnitsCompatible("g", "kg")).toBe(true);
  });

  test("kg and dt are compatible", () => {
    expect(areUnitsCompatible("kg", "dt")).toBe(true);
  });

  test("dt and t are compatible", () => {
    expect(areUnitsCompatible("dt", "t")).toBe(true);
  });

  test("g and t are compatible (all weight)", () => {
    expect(areUnitsCompatible("g", "t")).toBe(true);
  });

  test("ml and kg are incompatible (cross-group)", () => {
    expect(areUnitsCompatible("ml", "kg")).toBe(false);
  });

  test("l and g are incompatible", () => {
    expect(areUnitsCompatible("l", "g")).toBe(false);
  });

  test("ml and t are incompatible", () => {
    expect(areUnitsCompatible("ml", "t")).toBe(false);
  });

  test("same unit is compatible with itself", () => {
    expect(areUnitsCompatible("kg", "kg")).toBe(true);
    expect(areUnitsCompatible("ml", "ml")).toBe(true);
  });
});

describe("convertUnit", () => {
  test("identity: 1 kg → kg = 1", () => {
    expect(convertUnit(1, "kg", "kg")).toBe(1);
  });

  test("1000 ml → l = 1", () => {
    expect(convertUnit(1000, "ml", "l")).toBeCloseTo(1);
  });

  test("1 l → ml = 1000", () => {
    expect(convertUnit(1, "l", "ml")).toBeCloseTo(1000);
  });

  test("1 t → kg = 1000", () => {
    expect(convertUnit(1, "t", "kg")).toBeCloseTo(1000);
  });

  test("1 dt → kg = 100", () => {
    expect(convertUnit(1, "dt", "kg")).toBeCloseTo(100);
  });

  test("500 g → kg = 0.5", () => {
    expect(convertUnit(500, "g", "kg")).toBeCloseTo(0.5);
  });

  test("1 g → kg = 0.001", () => {
    expect(convertUnit(1, "g", "kg")).toBeCloseTo(0.001);
  });

  test("1 kg → t = 0.001", () => {
    expect(convertUnit(1, "kg", "t")).toBeCloseTo(0.001);
  });

  test("2 dt → t = 0.2", () => {
    expect(convertUnit(2, "dt", "t")).toBeCloseTo(0.2);
  });

  test("throws on incompatible units (ml → kg)", () => {
    expect(() => convertUnit(1, "ml", "kg")).toThrow();
  });

  test("throws on incompatible units (l → g)", () => {
    expect(() => convertUnit(1, "l", "g")).toThrow();
  });
});
