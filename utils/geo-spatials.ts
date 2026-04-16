import { Plot } from "@/api/plots.api";
import * as turf from "@turf/turf";

export type LatLng = { latitude: number; longitude: number };
export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
// LngLat as [longitude, latitude] — the GeoJSON / MapLibre convention
export type LngLat = [number, number];

export interface BoundingBox {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}
export type Point = {
  type: "Point";
  coordinates: [number, number];
};
export type MultiPolygon = {
  type: "MultiPolygon";
  coordinates: number[][][][];
};

type PlotIntersetion = {
  plot: Plot;
  intersection: { geometry: GeoJSON.MultiPolygon; size: number };
};

export class GeoSpatials {
  /**
   * Translate the MapView's Viewport into a BoundingBox which is in shape of:
   * [west, south, east, north]
   * @param input
   * @param bufferInMeters additional Buffer in meters
   */
  static bufferedBBox(
    feature: GeoJSON.Feature,
    bufferInMeters = 0,
  ): GeoJSON.BBox {
    const bufferedPolygon = turf.buffer(feature, bufferInMeters, {
      units: "meters",
    })!;

    return turf.bbox(bufferedPolygon);
  }

  static isWithinBBox(
    feature: GeoJSON.Feature,
    bbox: GeoJSON.BBox,
    bufferInMeters = 0,
  ) {
    const boundingBoxPolygon = turf.buffer(
      turf.bboxPolygon(bbox),
      bufferInMeters,
      { units: "meters" },
    )!;
    return turf.booleanWithin(feature, boundingBoxPolygon);
  }

  static getMidpointFromCoordinates = (
    coordinate1: LatLng,
    coordinate2: LatLng,
  ): LatLng => {
    const point1 = turf.point([coordinate1.latitude, coordinate1.longitude]);
    const point2 = turf.point([coordinate2.latitude, coordinate2.longitude]);
    const {
      geometry: { coordinates },
    } = turf.midpoint(point1, point2);
    return {
      latitude: coordinates[0],
      longitude: coordinates[1],
    };
  };

  static isEqual(
    polygon: GeoJSON.MultiPolygon,
    otherPolygon: GeoJSON.MultiPolygon,
  ): boolean {
    return turf.booleanEqual(
      turf.multiPolygon(polygon.coordinates),
      turf.multiPolygon(otherPolygon.coordinates),
    );
  }

  static getRegionCenter(region: Region): LatLng {
    const bbox: GeoJSON.BBox = [
      region.longitude - region.longitudeDelta / 2,
      region.latitude - region.latitudeDelta / 2,
      region.longitude + region.longitudeDelta / 2,
      region.latitude + region.latitudeDelta / 2,
    ];
    const [lng, lat] = turf.center(turf.bboxPolygon(bbox)).geometry.coordinates;
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  static latLngToMultiPolygon(coordinates: LatLng[][]): GeoJSON.MultiPolygon {
    return {
      type: "MultiPolygon",
      coordinates: coordinates.map((polygonCoordinates) => [
        polygonCoordinates.map((latLng) => [latLng.longitude, latLng.latitude]),
      ]),
    };
  }

  static coordinatesToLatLng(coordinates: number[][]): LatLng[] {
    return coordinates.map((coordinate) => ({
      latitude: coordinate[1],
      longitude: coordinate[0],
    }));
  }

  static plotIntersections(
    plots: Plot[],
    polygon: GeoJSON.MultiPolygon,
  ): PlotIntersetion[] {
    const polygonFeature = turf.multiPolygon(polygon.coordinates);
    const intersecions: PlotIntersetion[] = [];
    for (const plot of plots) {
      const underlyingPolygonFeature = turf.multiPolygon(
        plot.geometry.coordinates,
      );
      const intersection = turf.intersect(
        turf.featureCollection([polygonFeature, underlyingPolygonFeature]),
      );
      if (intersection) {
        if (intersection.geometry.type === "Polygon") {
          intersecions.push({
            plot,
            intersection: {
              geometry: {
                ...intersection.geometry,
                type: "MultiPolygon",
                coordinates: [intersection.geometry.coordinates],
              },
              size: turf.area(intersection.geometry),
            },
          });
        } else {
          intersecions.push({
            plot,
            intersection: {
              geometry: intersection.geometry,
              size: turf.area(intersection.geometry),
            },
          });
        }
      }
    }
    return intersecions;
  }

  static thinOutCoordinates = (
    coordinates: LatLng[],
    minDistance: number,
  ): Array<LatLng | undefined> => {
    if (coordinates.length === 0) return [];

    let result: Array<LatLng | undefined> = [coordinates[0]]; // Always keep the first point
    let lastPoint = coordinates[0];

    for (let i = 1; i < coordinates.length; i++) {
      const currentPoint = coordinates[i];
      const distance = turf.distance(
        [lastPoint.longitude, lastPoint.latitude],
        [currentPoint.longitude, currentPoint.latitude],
        { units: "meters" },
      );

      if (distance >= minDistance) {
        result.push(currentPoint);
        lastPoint = currentPoint;
      } else {
        result.push(undefined);
      }
    }

    // Optionally ensure the last point is included
    if (result[result.length - 1] !== coordinates[coordinates.length - 1]) {
      result.push(coordinates[coordinates.length - 1]);
    }

    return result;
  };

  // --- LngLat-based helpers (MapLibre convention: [lng, lat]) ---

  static lngLatToMultiPolygon(rings: LngLat[][]): GeoJSON.MultiPolygon {
    return {
      type: "MultiPolygon",
      coordinates: rings.map((ring) => {
        const coords = ring.map((c) => [c[0], c[1]]);
        // Close ring per GeoJSON spec (first coord === last coord)
        if (coords.length > 0) {
          const first = coords[0];
          const last = coords[coords.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            coords.push([first[0], first[1]]);
          }
        }
        return [coords];
      }),
    };
  }

  static plotIntersectionsFromLngLat(
    plots: Plot[],
    polygon: GeoJSON.MultiPolygon,
  ): PlotIntersetion[] {
    // Delegates to the existing LatLng version — same logic, no conversion needed
    // since the polygon is already in GeoJSON format
    return GeoSpatials.plotIntersections(plots, polygon);
  }
}

export function splitMultiPolygonByLine(
  multiPolygon: GeoJSON.MultiPolygon,
  line: GeoJSON.LineString,
): GeoJSON.MultiPolygon[] | null {
  const cleanMulti: GeoJSON.MultiPolygon = turf.cleanCoords(
    turf.clone(multiPolygon),
  );
  const cleanLine: GeoJSON.LineString = turf.cleanCoords(turf.clone(line));
  const flattened = turf.flatten(cleanMulti);
  const lineCoords = cleanLine.coordinates as number[][];

  // Extend the line well beyond the polygon in both directions so the half-planes
  // cover the full plot regardless of where the user drew the line.
  // Use 20× the polygon's diagonal as the extension/offset distance.
  const bbox = turf.bbox(cleanMulti);
  const diagKm = turf.distance(
    turf.point([bbox[0], bbox[1]]),
    turf.point([bbox[2], bbox[3]]),
  );
  const extDist = Math.max(diagKm * 20, 10); // km, at least 10km
  const bearing = turf.bearing(
    turf.point(lineCoords[0]),
    turf.point(lineCoords[lineCoords.length - 1]),
  );
  const extStart = turf.destination(
    turf.point(lineCoords[0]),
    -extDist,
    bearing,
    { units: "kilometers" },
  ).geometry.coordinates;
  const extEnd = turf.destination(
    turf.point(lineCoords[lineCoords.length - 1]),
    extDist,
    bearing,
    { units: "kilometers" },
  ).geometry.coordinates;
  const extCoords = [extStart, ...lineCoords, extEnd];
  const extLineFeature = turf.lineString(extCoords);

  // Build two half-plane polygons — one on each side of the extended line
  const offsetA = turf.lineOffset(extLineFeature, extDist, {
    units: "kilometers",
  });
  const offsetB = turf.lineOffset(extLineFeature, -extDist, {
    units: "kilometers",
  });
  const coordsA = turf.getCoords(offsetA) as number[][];
  const coordsB = turf.getCoords(offsetB) as number[][];
  const halfPlaneA = turf.polygon([
    [...extCoords, ...[...coordsA].reverse(), extCoords[0]],
  ]);
  const halfPlaneB = turf.polygon([
    [...extCoords, ...[...coordsB].reverse(), extCoords[0]],
  ]);

  const sideA: GeoJSON.Polygon["coordinates"][] = [];
  const sideB: GeoJSON.Polygon["coordinates"][] = [];
  let anySplit = false;

  const pushGeom = (
    target: GeoJSON.Polygon["coordinates"][],
    geom: GeoJSON.Geometry,
  ) => {
    if (geom.type === "Polygon") target.push(geom.coordinates);
    else if (geom.type === "MultiPolygon")
      for (const c of geom.coordinates) target.push(c);
  };

  for (const feature of flattened.features) {
    const pieceA = turf.intersect(
      turf.featureCollection([feature, halfPlaneA]),
    );
    const pieceB = turf.intersect(
      turf.featureCollection([feature, halfPlaneB]),
    );
    const aHasArea = pieceA && turf.area(pieceA) > 0.1;
    const bHasArea = pieceB && turf.area(pieceB) > 0.1;

    if (aHasArea && bHasArea) {
      anySplit = true;
      pushGeom(sideA, pieceA.geometry);
      pushGeom(sideB, pieceB.geometry);
    } else if (aHasArea) {
      pushGeom(sideA, feature.geometry);
    } else if (bHasArea) {
      pushGeom(sideB, feature.geometry);
    }
  }

  if (!anySplit) return null;

  const toMultiPolygon = (
    coords: GeoJSON.Polygon["coordinates"][],
  ): GeoJSON.MultiPolygon => ({
    type: "MultiPolygon",
    coordinates: coords
      .map((c) => {
        const truncated = turf.truncate(turf.polygon(c), { precision: 8 });
        try {
          return turf.cleanCoords(truncated).geometry.coordinates;
        } catch {
          return truncated.geometry.coordinates;
        }
      })
      .filter((c) => {
        try {
          return turf.area(turf.polygon(c)) > 0.1;
        } catch {
          return false;
        }
      }),
  });

  const resultA = toMultiPolygon(sideA);
  const resultB = toMultiPolygon(sideB);
  return resultA.coordinates.length > 0 && resultB.coordinates.length > 0
    ? [resultA, resultB]
    : null;
}

/**
 * Extract a sub-polygon from a MultiPolygon by point.
 * Returns the remaining MultiPolygon and the extracted one, or null if the
 * point doesn't hit any sub-polygon or there's only one.
 */
export function extractSubPolygonByPoint(
  multiPolygon: GeoJSON.MultiPolygon,
  point: { latitude: number; longitude: number },
): { remaining: GeoJSON.MultiPolygon; extracted: GeoJSON.MultiPolygon } | null {
  if (multiPolygon.coordinates.length <= 1) return null;

  const turfPoint = turf.point([point.longitude, point.latitude]);
  for (let j = 0; j < multiPolygon.coordinates.length; j++) {
    const poly = turf.polygon(multiPolygon.coordinates[j]);
    if (!turf.booleanPointInPolygon(turfPoint, poly)) continue;

    return {
      remaining: {
        type: "MultiPolygon",
        coordinates: multiPolygon.coordinates.filter((_, idx) => idx !== j),
      },
      extracted: {
        type: "MultiPolygon",
        coordinates: [multiPolygon.coordinates[j]],
      },
    };
  }
  return null;
}

/** LngLat version — accepts [lng, lat][] ring (must be closed) */
export function cutPolygonFromMultiPolygonLngLat(
  multiPolygon: GeoJSON.MultiPolygon,
  drawnRing: LngLat[],
): {
  remaining: GeoJSON.MultiPolygon;
  plots: GeoJSON.MultiPolygon;
} | null {
  // Convert to the LatLng format expected by the original function
  const latLngRing = drawnRing.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));
  // Close the ring if not already closed
  if (
    latLngRing.length > 0 &&
    (latLngRing[0].latitude !== latLngRing[latLngRing.length - 1].latitude ||
      latLngRing[0].longitude !== latLngRing[latLngRing.length - 1].longitude)
  ) {
    latLngRing.push(latLngRing[0]);
  }
  return cutPolygonFromMultiPolygon(multiPolygon, latLngRing);
}

export function cutPolygonFromMultiPolygon(
  multiPolygon: GeoJSON.MultiPolygon,
  drawnPolygon: { latitude: number; longitude: number }[],
): {
  remaining: GeoJSON.MultiPolygon;
  plots: GeoJSON.MultiPolygon;
} | null {
  // Convert LatLng[] to GeoJSON Polygon
  const cutPolygon = turf.polygon([
    drawnPolygon.map((p) => [p.longitude, p.latitude]),
  ]);

  const flattened = turf.flatten(multiPolygon);

  const remainingPolygons: GeoJSON.Position[][][] = [];
  const cutPieces: GeoJSON.Position[][][] = [];

  for (const feature of flattened.features) {
    const polygon = feature;

    if (!turf.booleanIntersects(polygon, cutPolygon)) {
      remainingPolygons.push(polygon.geometry.coordinates);
      continue;
    }

    // Use intersection for the cut piece — more stable than double-difference
    // at shared edges between adjacent sub-polygons.
    const cutIntersection = turf.intersect(
      turf.featureCollection([polygon, cutPolygon]),
    );
    const remainingGeometry = turf.difference(
      turf.featureCollection([polygon, cutPolygon]),
    );

    if (!remainingGeometry) {
      // Fully covered by cut polygon
      cutPieces.push(polygon.geometry.coordinates);
      continue;
    }

    if (remainingGeometry.geometry.type === "Polygon") {
      remainingPolygons.push(remainingGeometry.geometry.coordinates);
    } else if (remainingGeometry.geometry.type === "MultiPolygon") {
      for (const coordinate of remainingGeometry.geometry.coordinates) {
        remainingPolygons.push(coordinate);
      }
    }

    if (cutIntersection) {
      if (cutIntersection.geometry.type === "Polygon") {
        cutPieces.push(cutIntersection.geometry.coordinates);
      } else if (cutIntersection.geometry.type === "MultiPolygon") {
        for (const coordinate of cutIntersection.geometry.coordinates) {
          cutPieces.push(coordinate);
        }
      }
    }
  }

  if (cutPieces.length === 0) return null;

  // Truncate precision so near-duplicate vertices from turf.difference collapse,
  // remove redundant coordinates, and discard degenerate slivers (area < 0.1 m²).
  const cleanPolygonCoords = (coords: GeoJSON.Position[][][]) =>
    coords
      .map((c) => {
        const poly = turf.polygon(c);
        const truncated = turf.truncate(poly, { precision: 6 });
        try {
          return turf.cleanCoords(truncated).geometry.coordinates;
        } catch {
          return truncated.geometry.coordinates;
        }
      })
      .filter((c) => {
        try {
          return turf.area(turf.polygon(c)) > 0.1;
        } catch {
          return false;
        }
      });

  const cleanedCut = cleanPolygonCoords(cutPieces);
  if (cleanedCut.length === 0) return null;

  const cleanedRemaining = cleanPolygonCoords(remainingPolygons);
  // If the entire remaining geometry was filtered out (all slivers), treat the
  // original polygon as fully covered by the cut.
  if (cleanedRemaining.length === 0) {
    return {
      remaining: { type: "MultiPolygon", coordinates: [] },
      plots: turf.multiPolygon(cleanedCut).geometry,
    };
  }

  return {
    remaining: turf.multiPolygon(cleanedRemaining).geometry,
    plots: turf.multiPolygon(cleanedCut).geometry,
  };
}
