import { Plot } from "@/api/plots.api";
import * as turf from "@turf/turf";
import { LatLng, Region } from "react-native-maps";

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
    bufferInMeters = 0
  ): GeoJSON.BBox {
    const bufferedPolygon = turf.buffer(feature, bufferInMeters, {
      units: "meters",
    })!;

    return turf.bbox(bufferedPolygon);
  }

  static isWithinBBox(
    feature: GeoJSON.Feature,
    bbox: GeoJSON.BBox,
    bufferInMeters = 0
  ) {
    const boundingBoxPolygon = turf.buffer(
      turf.bboxPolygon(bbox),
      bufferInMeters,
      { units: "meters" }
    )!;
    return turf.booleanWithin(feature, boundingBoxPolygon);
  }

  static getMidpointFromCoordinates = (
    coordinate1: LatLng,
    coordinate2: LatLng
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
    otherPolygon: GeoJSON.MultiPolygon
  ): boolean {
    return turf.booleanEqual(
      turf.multiPolygon(polygon.coordinates),
      turf.multiPolygon(otherPolygon.coordinates)
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
    polygon: GeoJSON.MultiPolygon
  ): PlotIntersetion[] {
    const polygonFeature = turf.multiPolygon(polygon.coordinates);
    const intersecions: PlotIntersetion[] = [];
    for (const plot of plots) {
      const underlyingPolygonFeature = turf.multiPolygon(
        plot.geometry.coordinates
      );
      const intersection = turf.intersect(
        turf.featureCollection([polygonFeature, underlyingPolygonFeature])
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
    minDistance: number
  ): Array<LatLng | undefined> => {
    if (coordinates.length === 0) return [];

    let result: Array<LatLng | undefined> = [coordinates[0]]; // Always keep the first point
    let lastPoint = coordinates[0];

    for (let i = 1; i < coordinates.length; i++) {
      const currentPoint = coordinates[i];
      const distance = turf.distance(
        [lastPoint.longitude, lastPoint.latitude],
        [currentPoint.longitude, currentPoint.latitude],
        { units: "meters" }
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
}
