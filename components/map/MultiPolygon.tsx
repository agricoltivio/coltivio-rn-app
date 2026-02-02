import { useMemo } from "react";
import { GeojsonProps, Polygon, PolygonPressEvent } from "react-native-maps";

export type MulitiPolygonProps = Omit<GeojsonProps, "geojson" | "onPress"> & {
  polygon: GeoJSON.MultiPolygon;
  onPress?: (event: PolygonPressEvent) => void;
};

export function MultiPolygon({
  polygon,
  onPress,
  ...rest
}: MulitiPolygonProps) {
  function handleOnPress(event: PolygonPressEvent) {
    event.stopPropagation();
    onPress && onPress(event);
  }
  const polygons = useMemo(
    () =>
      polygon.coordinates.map((polygon, index) => {
        const coordinates = [...polygon];
        const outerRing = coordinates[0].map((coordinate) => ({
          latitude: coordinate[1],
          longitude: coordinate[0],
        }));
        let holes;
        if (coordinates.length > 1) {
          holes = coordinates.slice(1).map((hole) =>
            hole.map((coordinate) => ({
              latitude: coordinate[1],
              longitude: coordinate[0],
            })),
          );
        }

        return (
          <Polygon
            key={index}
            coordinates={outerRing}
            holes={holes}
            onPress={onPress}
            {...rest}
          />
        );
      }),
    [polygon, rest],
  );

  return polygons;
}
