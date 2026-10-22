import { describe, expect, test } from "@jest/globals";
import { compareVersions, isNewerVersion, parseVersion } from "./version";

describe("parseVersion", () => {
  test("splits dotted numbers", () => {
    expect(parseVersion("1.0.7")).toEqual([1, 0, 7]);
  });

  test("strips a leading v and any prerelease or build suffix", () => {
    expect(parseVersion("v1.2.3-beta.1")).toEqual([1, 2, 3]);
    expect(parseVersion("1.2.3+42")).toEqual([1, 2, 3]);
  });

  test("treats garbage segments as 0", () => {
    expect(parseVersion("abc")).toEqual([0]);
  });
});

describe("compareVersions", () => {
  test("equal versions", () => {
    expect(compareVersions("1.0.7", "1.0.7")).toBe(0);
    expect(compareVersions("1.0", "1.0.0")).toBe(0);
  });

  test("patch, minor and major ordering", () => {
    expect(compareVersions("1.0.8", "1.0.7")).toBe(1);
    expect(compareVersions("1.1.0", "1.0.9")).toBe(1);
    expect(compareVersions("2.0.0", "1.9.9")).toBe(1);
    expect(compareVersions("1.0.7", "1.0.8")).toBe(-1);
  });

  test("compares numerically, not lexically", () => {
    expect(compareVersions("1.0.10", "1.0.9")).toBe(1);
  });
});

describe("isNewerVersion", () => {
  test("only strictly newer counts", () => {
    expect(isNewerVersion("1.0.8", "1.0.7")).toBe(true);
    expect(isNewerVersion("1.0.7", "1.0.7")).toBe(false);
    expect(isNewerVersion("1.0.6", "1.0.7")).toBe(false);
  });
});
