import { describe, test, expect } from "@jest/globals";
import {
  INFINITE_DATE,
  isInfiniteDate,
  getMinMaxIso,
  getYearRange,
  combineDateAndTime,
} from "./date";

describe("isInfiniteDate", () => {
  test("INFINITE_DATE constant itself returns true", () => {
    expect(isInfiniteDate(INFINITE_DATE)).toBe(true);
  });

  test("a date equal to INFINITE_DATE returns true", () => {
    expect(isInfiniteDate(new Date("4999-12-31T00:00:00Z"))).toBe(true);
  });

  test("today returns false", () => {
    expect(isInfiniteDate(new Date())).toBe(false);
  });

  test("a date just before INFINITE_DATE returns false", () => {
    expect(isInfiniteDate(new Date("4999-12-30T23:59:59Z"))).toBe(false);
  });

  test("a date after INFINITE_DATE returns true", () => {
    expect(isInfiniteDate(new Date("5000-01-01T00:00:00Z"))).toBe(true);
  });
});

describe("getMinMaxIso", () => {
  test("empty array returns null", () => {
    expect(getMinMaxIso([])).toBeNull();
  });

  test("single element returns min and max as that element", () => {
    expect(getMinMaxIso(["2025-06-01"])).toEqual({
      min: "2025-06-01",
      max: "2025-06-01",
    });
  });

  test("sorted ascending array returns correct min/max", () => {
    expect(
      getMinMaxIso(["2024-01-01", "2024-06-15", "2025-12-31"]),
    ).toEqual({ min: "2024-01-01", max: "2025-12-31" });
  });

  test("unsorted array returns correct min/max", () => {
    expect(
      getMinMaxIso(["2025-03-01", "2023-07-15", "2024-11-30"]),
    ).toEqual({ min: "2023-07-15", max: "2025-03-01" });
  });

  test("two-element array", () => {
    expect(getMinMaxIso(["2025-12-31", "2020-01-01"])).toEqual({
      min: "2020-01-01",
      max: "2025-12-31",
    });
  });
});

describe("getYearRange", () => {
  test("from = Jan 1 00:00:00.000", () => {
    const { from } = getYearRange(2025);
    expect(from.getFullYear()).toBe(2025);
    expect(from.getMonth()).toBe(0);
    expect(from.getDate()).toBe(1);
    expect(from.getHours()).toBe(0);
    expect(from.getMinutes()).toBe(0);
    expect(from.getSeconds()).toBe(0);
    expect(from.getMilliseconds()).toBe(0);
  });

  test("to = Dec 31 23:59:59.999", () => {
    const { to } = getYearRange(2025);
    expect(to.getFullYear()).toBe(2025);
    expect(to.getMonth()).toBe(11);
    expect(to.getDate()).toBe(31);
    expect(to.getHours()).toBe(23);
    expect(to.getMinutes()).toBe(59);
    expect(to.getSeconds()).toBe(59);
    expect(to.getMilliseconds()).toBe(999);
  });

  test("works for a leap year", () => {
    const { to } = getYearRange(2024);
    expect(to.getFullYear()).toBe(2024);
    expect(to.getMonth()).toBe(11);
    expect(to.getDate()).toBe(31);
  });
});

describe("combineDateAndTime", () => {
  test("takes date parts from first arg and hour/minute from second", () => {
    const date = new Date(2025, 5, 15, 9, 0, 0, 0); // Jun 15 2025 09:00
    const time = new Date(2025, 0, 1, 14, 30, 0, 0); // Jan 1 2025 14:30
    const result = combineDateAndTime(date, time);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  test("seconds and milliseconds are zeroed out", () => {
    const date = new Date(2025, 5, 15);
    const time = new Date(2025, 0, 1, 10, 45, 33, 500);
    const result = combineDateAndTime(date, time);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  test("midnight time results in 00:00", () => {
    const date = new Date(2025, 0, 1);
    const time = new Date(2025, 0, 1, 0, 0, 0, 0);
    const result = combineDateAndTime(date, time);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});
