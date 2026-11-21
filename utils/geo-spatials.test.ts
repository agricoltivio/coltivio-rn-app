import { describe, test, expect } from "@jest/globals";
import {
  GeoSpatials,
  splitMultiPolygonByLine,
  cutPolygonFromMultiPolygon,
} from "./geo-spatials";
import * as turf from "@turf/turf";

// Unit square [0,0]→[1,0]→[1,1]→[0,1]→[0,0]
const UNIT_SQUARE_COORDS: number[][][] = [
  [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
    [0, 0],
  ],
];

const UNIT_SQUARE: GeoJSON.MultiPolygon = {
  type: "MultiPolygon",
  coordinates: [UNIT_SQUARE_COORDS],
};

// Second square offset to [2,0]→[3,0]→[3,1]→[2,1]→[2,0]
const SECOND_SQUARE_COORDS: number[][][] = [
  [
    [2, 0],
    [3, 0],
    [3, 1],
    [2, 1],
    [2, 0],
  ],
];

const TWO_SQUARE_MULTI: GeoJSON.MultiPolygon = {
  type: "MultiPolygon",
  coordinates: [UNIT_SQUARE_COORDS, SECOND_SQUARE_COORDS],
};

// ---------------------------------------------------------------------------
// Coordinate conversion methods
// ---------------------------------------------------------------------------

describe("GeoSpatials.latLngToMultiPolygon", () => {
  test("converts LatLng[][] to MultiPolygon with [lng, lat] coordinate order", () => {
    const result = GeoSpatials.latLngToMultiPolygon([
      [
        { latitude: 48.0, longitude: 16.0 },
        { latitude: 48.5, longitude: 16.5 },
        { latitude: 47.5, longitude: 16.5 },
      ],
    ]);
    expect(result.type).toBe("MultiPolygon");
    expect(result.coordinates[0][0][0]).toEqual([16.0, 48.0]); // [lng, lat]
    expect(result.coordinates[0][0][1]).toEqual([16.5, 48.5]);
  });
});

describe("GeoSpatials.coordinatesToLatLng", () => {
  test("converts [[lng, lat]] to LatLng[]", () => {
    const result = GeoSpatials.coordinatesToLatLng([
      [16.0, 48.0],
      [16.5, 48.5],
    ]);
    expect(result[0]).toEqual({ latitude: 48.0, longitude: 16.0 });
    expect(result[1]).toEqual({ latitude: 48.5, longitude: 16.5 });
  });
});

describe("GeoSpatials.lngLatToMultiPolygon", () => {
  test("closes open ring (first !== last)", () => {
    const ring: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const result = GeoSpatials.lngLatToMultiPolygon([ring]);
    const coords = result.coordinates[0][0];
    // First and last should be equal
    expect(coords[0]).toEqual(coords[coords.length - 1]);
    expect(coords).toHaveLength(5);
  });

  test("leaves already-closed ring unchanged (no duplicate added)", () => {
    const ring: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ];
    const result = GeoSpatials.lngLatToMultiPolygon([ring]);
    const coords = result.coordinates[0][0];
    expect(coords).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// thinOutCoordinates
// ---------------------------------------------------------------------------

describe("GeoSpatials.thinOutCoordinates", () => {
  test("empty input → []", () => {
    expect(GeoSpatials.thinOutCoordinates([], 10)).toEqual([]);
  });

  test("two points far apart (> minDistance) → both kept", () => {
    // 1 degree of latitude ≈ 111 km — well above any reasonable minDistance in meters
    const result = GeoSpatials.thinOutCoordinates(
      [
        { latitude: 0, longitude: 0 },
        { latitude: 1, longitude: 0 },
      ],
      100, // 100 meters — way smaller than actual distance
    );
    expect(result[0]).toEqual({ latitude: 0, longitude: 0 });
    expect(result[1]).toEqual({ latitude: 1, longitude: 0 });
    expect(result).toHaveLength(2);
  });

  test("points within minDistance: first kept, middle replaced with undefined, last appended", () => {
    // All points within 1 cm of each other
    const close = [
      { latitude: 0, longitude: 0 },
      { latitude: 0.00001, longitude: 0 }, // ~1.1m away
      { latitude: 0.00002, longitude: 0 }, // ~2.2m from start
    ];
    const result = GeoSpatials.thinOutCoordinates(close, 100_000); // 100km threshold
    expect(result[0]).toEqual({ latitude: 0, longitude: 0 });
    expect(result[result.length - 1]).toEqual({
      latitude: 0.00002,
      longitude: 0,
    });
  });

  test("last point always included even if close to previous kept point", () => {
    const points = [
      { latitude: 0, longitude: 0 },
      { latitude: 10, longitude: 0 }, // far — kept
      { latitude: 10.00001, longitude: 0 }, // close to previous kept
    ];
    const result = GeoSpatials.thinOutCoordinates(points, 1); // 1 meter
    expect(result[result.length - 1]).toEqual({
      latitude: 10.00001,
      longitude: 0,
    });
  });
});

// ---------------------------------------------------------------------------
// splitMultiPolygonByLine
// ---------------------------------------------------------------------------

describe("splitMultiPolygonByLine", () => {
  test("line doesn't cross polygon → null", () => {
    const line: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [5, 0],
        [5, 1],
      ], // entirely outside unit square
    };
    expect(splitMultiPolygonByLine(UNIT_SQUARE, line)).toBeNull();
  });

  test("vertical line through center splits unit square into two MultiPolygons", () => {
    // Line x=0.5, from y=-1 to y=2, fully cuts through the unit square
    const line: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [0.5, -1],
        [0.5, 2],
      ],
    };
    const result = splitMultiPolygonByLine(UNIT_SQUARE, line);
    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);
    // Total area should approximate 1 (original unit square area ≈ 1 sq degree)
    const area0 = turf.area(turf.multiPolygon(result![0].coordinates));
    const area1 = turf.area(turf.multiPolygon(result![1].coordinates));
    const originalArea = turf.area(turf.multiPolygon(UNIT_SQUARE.coordinates));
    expect(area0 + area1).toBeCloseTo(originalArea, -2); // within ~1% tolerance
  });
});

// ---------------------------------------------------------------------------
// cutPolygonFromMultiPolygon
// ---------------------------------------------------------------------------

describe("cutPolygonFromMultiPolygon", () => {
  test("drawn polygon doesn't intersect → null", () => {
    const drawnPolygon = [
      { latitude: 5, longitude: 5 },
      { latitude: 6, longitude: 5 },
      { latitude: 6, longitude: 6 },
      { latitude: 5, longitude: 6 },
      { latitude: 5, longitude: 5 },
    ];
    expect(cutPolygonFromMultiPolygon(UNIT_SQUARE, drawnPolygon)).toBeNull();
  });

  test("drawn polygon fully covers → remaining has empty coordinates, plots has original", () => {
    // Draw a big polygon covering the unit square entirely
    const drawnPolygon = [
      { latitude: -1, longitude: -1 },
      { latitude: 2, longitude: -1 },
      { latitude: 2, longitude: 2 },
      { latitude: -1, longitude: 2 },
      { latitude: -1, longitude: -1 },
    ];
    const result = cutPolygonFromMultiPolygon(UNIT_SQUARE, drawnPolygon);
    expect(result).not.toBeNull();
    expect(result!.remaining.coordinates).toHaveLength(0);
    expect(result!.plots.coordinates.length).toBeGreaterThan(0);
  });

  test("drawn polygon cuts left half of unit square", () => {
    // Draw a rectangle covering the left half [0,0]→[0.5,0]→[0.5,1]→[0,1]
    const drawnPolygon = [
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 0.5 },
      { latitude: 1, longitude: 0.5 },
      { latitude: 1, longitude: 0 },
      { latitude: 0, longitude: 0 },
    ];
    const result = cutPolygonFromMultiPolygon(UNIT_SQUARE, drawnPolygon);
    expect(result).not.toBeNull();
    const originalArea = turf.area(turf.multiPolygon(UNIT_SQUARE.coordinates));
    const remainingArea = turf.area(result!.remaining);
    const plotsArea = turf.area(result!.plots);
    // Each half ≈ 50% of original
    expect(remainingArea).toBeCloseTo(originalArea / 2, -3);
    expect(plotsArea).toBeCloseTo(originalArea / 2, -3);
  });
});

// ---------------------------------------------------------------------------
// GeoSpatials.getRegionCenter
// ---------------------------------------------------------------------------

describe("GeoSpatials.getRegionCenter", () => {
  test("region centered on (lat=48, lng=16, delta=2) → center = (lat=48, lng=16)", () => {
    const result = GeoSpatials.getRegionCenter({
      latitude: 48,
      longitude: 16,
      latitudeDelta: 2,
      longitudeDelta: 2,
    });
    expect(result.latitude).toBeCloseTo(48, 5);
    expect(result.longitude).toBeCloseTo(16, 5);
  });
});

// ---------------------------------------------------------------------------
// getMidpointFromCoordinates
// ---------------------------------------------------------------------------

describe("GeoSpatials.getMidpointFromCoordinates", () => {
  test("returns correct midpoint (two internal bugs cancel out: swapped point() args and swapped coordinates[] read)", () => {
    const p1 = { latitude: 48, longitude: 16 };
    const p2 = { latitude: 49, longitude: 17 };
    const result = GeoSpatials.getMidpointFromCoordinates(p1, p2);
    expect(result.latitude).toBeCloseTo(48.5, 0);
    expect(result.longitude).toBeCloseTo(16.5, 0);
  });
});

// A field of about 100 x 55 m near the coordinates of the Sentry report in #155
const FIELD: GeoJSON.MultiPolygon = {
  type: "MultiPolygon",
  coordinates: [
    [
      [
        [8.733, 47.582],
        [8.7343, 47.582],
        [8.7343, 47.5825],
        [8.733, 47.5825],
        [8.733, 47.582],
      ],
    ],
  ],
};

describe("splitMultiPolygonByLine robustness", () => {
  test("a line through only one part of a multipolygon keeps the other part whole", () => {
    const line: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [0.5, -1],
        [0.5, 2],
      ],
    };
    const result = splitMultiPolygonByLine(TWO_SQUARE_MULTI, line);
    expect(result).toHaveLength(2);
    const totalArea = result!.reduce((sum, piece) => sum + turf.area(piece), 0);
    expect(totalArea).toBeCloseTo(turf.area(TWO_SQUARE_MULTI), -3);
    // The second square stays in one piece, on one side of the line
    const sideWithSecondSquare = result!.find((piece) =>
      piece.coordinates.some((polygon) =>
        polygon[0].some(([longitude]) => longitude === 3),
      ),
    );
    expect(sideWithSecondSquare!.coordinates).toHaveLength(2);
  });

  test("near-duplicate cut points (double tap) still split the field", () => {
    const line: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [8.7336, 47.5815],
        [8.7336, 47.58150001], // ~1 mm from the previous point
        [8.7336, 47.583],
      ],
    };
    const result = splitMultiPolygonByLine(FIELD, line);
    expect(result).toHaveLength(2);
  });

  test("a last point close to the one before replaces it as the line's end", () => {
    // B + ~1 cm is dropped by the filter, then put back as the end in place of B
    const line: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [8.7336, 47.5815],
        [8.7336, 47.583],
        [8.7336001, 47.583], // ~1 cm east of the previous point
      ],
    };
    const result = splitMultiPolygonByLine(FIELD, line);
    expect(result).toHaveLength(2);
  });

  test("a line only made of points closer than 0.5 m returns null", () => {
    const line: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [8.7336, 47.5822],
        [8.7336, 47.582201],
      ],
    };
    expect(splitMultiPolygonByLine(FIELD, line)).toBeNull();
  });

  test("a line through two corners splits the field along its diagonal", () => {
    // Straight line through the corners (8.733, 47.582) and (8.7343, 47.5825), extended on both sides
    const slope = 0.0005 / 0.0013;
    const line: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [8.7327, 47.582 - 0.0003 * slope],
        [8.7346, 47.5825 + 0.0003 * slope],
      ],
    };
    const result = splitMultiPolygonByLine(FIELD, line);
    expect(result).toHaveLength(2);
    const areas = result!.map((piece) => turf.area(piece));
    expect(areas[0]).toBeCloseTo(areas[1], -1);
  });

  test("a sharply bent polyline doesn't throw", () => {
    const line: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [8.7333, 47.583],
        [8.7336, 47.5815],
        [8.7339, 47.583],
      ],
    };
    expect(() => splitMultiPolygonByLine(FIELD, line)).not.toThrow();
  });

  test("a polyline bending back on itself doesn't throw", () => {
    const line: GeoJSON.LineString = {
      type: "LineString",
      coordinates: [
        [8.7336, 47.5815],
        [8.7336, 47.583],
        [8.73361, 47.5815],
      ],
    };
    expect(() => splitMultiPolygonByLine(FIELD, line)).not.toThrow();
  });
});
