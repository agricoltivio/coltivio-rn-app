import { describe, test, expect } from "@jest/globals";
import { scaleUnit } from "./unitScaling";

describe("scaleUnit", () => {
  test("kg scales to t, dt, kg and g", () => {
    expect(scaleUnit("kg", 2500)).toEqual({ label: "t", divisor: 1000 });
    expect(scaleUnit("kg", 250)).toEqual({ label: "dt", divisor: 100 });
    expect(scaleUnit("kg", 5)).toEqual({ label: "kg", divisor: 1 });
    expect(scaleUnit("kg", 0.5)).toEqual({ label: "g", divisor: 0.001 });
  });

  test("l scales to hl, l and ml", () => {
    expect(scaleUnit("l", 250)).toEqual({ label: "hl", divisor: 100 });
    expect(scaleUnit("l", 5)).toEqual({ label: "l", divisor: 1 });
    expect(scaleUnit("l", 0.5)).toEqual({ label: "ml", divisor: 0.001 });
  });

  test("cubic metres are labelled m³ and not scaled", () => {
    expect(scaleUnit("m3", 4.24)).toEqual({ label: "m³", divisor: 1 });
  });
});
