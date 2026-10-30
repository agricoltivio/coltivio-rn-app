import { describe, test, expect, jest } from "@jest/globals";
import { isSelfIntersecting, withSavedHoles } from "./plot-geometry";

// The API client pulls in native modules (AsyncStorage) that don't load in Jest
jest.mock("@/api/api", () => ({ ApiError: class ApiError extends Error {} }));

const OUTER_RING = [
  [0, 0],
  [10, 0],
  [10, 10],
  [0, 10],
  [0, 0],
];
const HOLE = [
  [4, 4],
  [4, 6],
  [6, 6],
  [6, 4],
  [4, 4],
];
const SAVED_PLOT: GeoJSON.MultiPolygon = {
  type: "MultiPolygon",
  coordinates: [[OUTER_RING, HOLE]],
};

describe("withSavedHoles", () => {
  test("keeps a hole inside the adjusted outline", () => {
    const adjustedRing = [
      [-1, -1],
      [10, -1],
      [10, 10],
      [-1, 10],
      [-1, -1],
    ];
    expect(withSavedHoles([adjustedRing], SAVED_PLOT).coordinates).toEqual([
      [adjustedRing, HOLE],
    ]);
  });

  test("drops a hole the adjusted outline no longer touches", () => {
    const adjustedRing = [
      [0, 0],
      [3, 0],
      [3, 10],
      [0, 10],
      [0, 0],
    ];
    expect(withSavedHoles([adjustedRing], SAVED_PLOT).coordinates).toEqual([
      [adjustedRing],
    ]);
  });

  test("keeps a hole crossing the adjusted outline, which is then rejected", () => {
    const adjustedRing = [
      [0, 0],
      [5, 0],
      [5, 10],
      [0, 10],
      [0, 0],
    ];
    const adjusted = withSavedHoles([adjustedRing], SAVED_PLOT);
    expect(adjusted.coordinates).toEqual([[adjustedRing, HOLE]]);
    expect(isSelfIntersecting(adjusted)).toBe(true);
  });
});

describe("isSelfIntersecting", () => {
  test("accepts a plot with a hole inside", () => {
    expect(isSelfIntersecting(SAVED_PLOT)).toBe(false);
  });

  test("rejects crossing edges", () => {
    const bowtie: GeoJSON.MultiPolygon = {
      type: "MultiPolygon",
      coordinates: [
        [
          [
            [0, 0],
            [10, 10],
            [10, 0],
            [0, 10],
            [0, 0],
          ],
        ],
      ],
    };
    expect(isSelfIntersecting(bowtie)).toBe(true);
  });
});
