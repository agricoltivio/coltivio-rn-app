import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import {
  DrawAction,
  PolygonDrawingTool,
  PolygonDrawingToolActions,
} from "@/components/map/PolygonDrawingTool";
import { hexToRgba } from "@/theme/theme";
import { Title } from "@/theme/Typography";
import { round } from "@/utils/math";
import { PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, StyleSheet, View } from "react-native";
import { LatLng, MapPressEvent, Region } from "react-native-maps";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { MapShowLocationToggle } from "../map/MapShowLocationToggle";
import { SplitPlotMapScreenProps } from "./navigation/plots-routes";
import { useFarmPlotsQuery } from "./plots.hooks";
import { SubPlotData, useSplitPlotStore } from "./split-plot.store";

type SplitMode = "line" | "polygon" | "none";

export function SplitPlotMapScreen({
  navigation,
  route,
}: SplitPlotMapScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const frame = useSafeAreaFrame();
  const { plotId } = route.params;
  const { plots } = useFarmPlotsQuery();
  const splitPlotStore = useSplitPlotStore();

  const [mapVisible, setMapVisible] = useState(false);
  const [showsUserLocation, setShowsUserLocation] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>("none");
  const [drawingAction, setDrawingAction] = useState<DrawAction>("select");
  const [subPlots, setSubPlots] = useState<SubPlotData[] | null>(null);

  const polygonDrawingToolRef = useRef<PolygonDrawingToolActions>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true);
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    return () => splitPlotStore.reset();
  }, []);

  const plot = plots?.find((p) => p.id === plotId);

  if (!plot || !plots) {
    return null;
  }

  const centroid = turf.centroid(plot.geometry);
  const [longitude, latitude] = centroid.geometry.coordinates;
  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.0025,
    longitudeDelta: 0.0025,
  };

  const handleMapPress = (event: MapPressEvent) => {
    if (drawingAction === "draw") {
      event.stopPropagation();
      polygonDrawingToolRef.current?.drawToPoint(event.nativeEvent.coordinate);
    }
  };

  function handleModeSelect(mode: "line" | "polygon") {
    setSplitMode(mode);
    setDrawingAction("draw");
    setSubPlots(null);
  }

  // Compute sub-plots from the drawn coordinates depending on the split mode
  function onFinishDrawing(coordinates: LatLng[]) {
    const plotFeature = turf.multiPolygon(plot!.geometry.coordinates);

    if (splitMode === "line") {
      // Interpret drawn coordinates as a line, buffer it, then subtract from plot
      const lineCoords = coordinates.map((c) => [c.longitude, c.latitude]);
      const line = turf.lineString(lineCoords);
      const buffered = turf.buffer(line, 0.5, { units: "meters" });
      if (!buffered) {
        Alert.alert(t("plots.split.split_failed"));
        return;
      }
      const result = turf.difference(
        turf.featureCollection([plotFeature, buffered])
      );
      if (!result) {
        Alert.alert(t("plots.split.split_failed"));
        return;
      }
      const extracted = extractSubPlots(result.geometry);
      if (extracted.length < 2) {
        Alert.alert(t("plots.split.split_failed"));
        return;
      }
      setSubPlots(extracted);
    } else {
      // Polygon carve-out: intersect and difference
      const drawnPolygon = turf.polygon([
        [
          ...coordinates.map((c) => [c.longitude, c.latitude]),
          [coordinates[0].longitude, coordinates[0].latitude],
        ],
      ]);
      const intersection = turf.intersect(
        turf.featureCollection([plotFeature, drawnPolygon])
      );
      const remainder = turf.difference(
        turf.featureCollection([plotFeature, drawnPolygon])
      );
      if (!intersection || !remainder) {
        Alert.alert(t("plots.split.split_failed"));
        return;
      }
      const subPlotA = toMultiPolygon(intersection.geometry);
      const subPlotB = toMultiPolygon(remainder.geometry);
      setSubPlots([
        { geometry: subPlotA, size: round(turf.area(subPlotA), 0) },
        { geometry: subPlotB, size: round(turf.area(subPlotB), 0) },
      ]);
    }
  }

  function handleNext() {
    if (!subPlots) return;
    splitPlotStore.setData(subPlots, plot!.name);
    navigation.navigate("SplitPlotSummary", { plotId });
  }

  // Background plot polygons (all plots except current)
  const otherPlotPolygons = plots
    .filter((p) => p.id !== plotId)
    .map((p) => (
      <MultiPolygon
        key={p.id}
        polygon={p.geometry}
        strokeWidth={theme.map.defaultStrokeWidth}
        strokeColor="white"
        fillColor={hexToRgba(
          theme.map.defaultFillColor,
          theme.map.defaultFillAlpha
        )}
      />
    ));

  // Sub-plot preview colors
  const subPlotColors = [
    theme.colors.success,
    theme.colors.accent,
    theme.colors.secondary,
    theme.colors.danger,
  ];

  return (
    <ContentView
      headerVisible={false}
      footerComponent={
        <BottomActionContainer floating>
          <Button
            title={t("buttons.next")}
            onPress={handleNext}
            disabled={!subPlots || subPlots.length < 2}
          />
        </BottomActionContainer>
      }
    >
      <MapView
        loading={!mapVisible}
        style={StyleSheet.absoluteFillObject}
        onPress={handleMapPress}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
      >
        {otherPlotPolygons}
        {/* Target plot */}
        <MultiPolygon
          polygon={plot.geometry}
          strokeWidth={theme.map.defaultStrokeWidth}
          strokeColor="white"
          fillColor={hexToRgba(
            theme.map.defaultFillColor,
            theme.map.defaultFillAlpha
          )}
        />
        {/* Sub-plot preview */}
        {subPlots?.map((sp, i) => (
          <MultiPolygon
            key={`sub-${i}`}
            polygon={sp.geometry}
            strokeWidth={2}
            strokeColor="white"
            fillColor={hexToRgba(
              subPlotColors[i % subPlotColors.length],
              0.6
            )}
          />
        ))}
        {splitMode !== "none" && (
          <PolygonDrawingTool
            initialAction="draw"
            portalName="SplitPlotMap"
            ref={polygonDrawingToolRef}
            onDrawActionChange={setDrawingAction}
            magnifierMapContent={otherPlotPolygons}
            onFinish={onFinishDrawing}
          />
        )}
      </MapView>
      <TopLeftBackButton />
      <MapShowLocationToggle onShowLocationChange={setShowsUserLocation} />
      <PortalHost name="SplitPlotMap" />
      {/* Mode select card */}
      {splitMode === "none" && (
        <Card
          style={{
            position: "absolute",
            top: frame.height / 2 - 100,
            left: theme.spacing.m,
            right: theme.spacing.m,
          }}
        >
          <Title>{t("plots.split.mode_select_message")}</Title>
          <View
            style={{
              marginTop: theme.spacing.m,
              flexDirection: "row",
              gap: theme.spacing.m,
              justifyContent: "center",
            }}
          >
            <Button
              type="accent"
              fontSize={17}
              title={t("plots.split.mode_line")}
              onPress={() => handleModeSelect("line")}
            />
            <Button
              type="accent"
              fontSize={17}
              title={t("plots.split.mode_polygon")}
              onPress={() => handleModeSelect("polygon")}
            />
          </View>
        </Card>
      )}
    </ContentView>
  );
}

// Extract individual polygons from a geometry result as MultiPolygon sub-plots
function extractSubPlots(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): SubPlotData[] {
  if (geometry.type === "Polygon") {
    const mp: GeoJSON.MultiPolygon = {
      type: "MultiPolygon",
      coordinates: [geometry.coordinates],
    };
    return [{ geometry: mp, size: round(turf.area(mp), 0) }];
  }
  // MultiPolygon: each set of coordinates is a separate sub-plot
  return geometry.coordinates.map((coords) => {
    const mp: GeoJSON.MultiPolygon = {
      type: "MultiPolygon",
      coordinates: [coords],
    };
    return { geometry: mp, size: round(turf.area(mp), 0) };
  });
}

function toMultiPolygon(
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
): GeoJSON.MultiPolygon {
  if (geometry.type === "MultiPolygon") return geometry;
  return { type: "MultiPolygon", coordinates: [geometry.coordinates] };
}
