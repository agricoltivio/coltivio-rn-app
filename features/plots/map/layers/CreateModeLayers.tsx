import { MultiPolygon } from "@/components/map/MultiPolygon";
import {
  PolygonDrawingTool,
  PolygonDrawingToolActions,
} from "@/components/map/PolygonDrawingTool";
import { Card } from "@/components/card/Card";
import { hexToRgba } from "@/theme/theme";
import { GeoSpatials } from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import { Subtitle } from "@/theme/Typography";
import * as turf from "@turf/turf";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { LatLng, MapPressEvent, Marker } from "react-native-maps";
import { useTheme } from "styled-components/native";
import { usePlotsMapContext } from "../plots-map-mode";

export type CreateModeLayersHandle = {
  handleMapPress: (event: MapPressEvent) => void;
};

export const CreateModeLayers = forwardRef<CreateModeLayersHandle>(
  function CreateModeLayers(_props, ref) {
    const theme = useTheme();
    const { mode, dispatch, plots, navigation } = usePlotsMapContext();
    const polygonDrawingToolRef = useRef<PolygonDrawingToolActions>(null);

    useImperativeHandle(ref, () => ({
      handleMapPress(event: MapPressEvent) {
        if (mode.type !== "create") return;
        if (mode.drawingAction === "draw") {
          event.stopPropagation();
          polygonDrawingToolRef.current?.drawToPoint(
            event.nativeEvent.coordinate,
          );
        }
      },
    }));

    if (mode.type !== "create") return null;

    const { drawingAction, newPolygon } = mode;

    function onFinishDrawing(coordinates: LatLng[]) {
      const polygon = GeoSpatials.latLngToMultiPolygon([coordinates]);
      const centroid = turf.centroid(polygon);
      const area = turf.area(polygon);
      dispatch({
        type: "SET_CREATE_POLYGON",
        polygon: {
          geometry: polygon,
          centroid: centroid.geometry,
          size: round(area, 0),
        },
      });
    }

    function onSelectPolygon() {
      if (drawingAction === "select" && newPolygon) {
        polygonDrawingToolRef.current?.editPolygon(
          newPolygon.geometry.coordinates[0][0].map(
            ([longitude, latitude]) => ({
              longitude,
              latitude,
            }),
          ),
        );
      }
    }

    // Background: show existing plots dimmed
    const plotPolygons = plots.map((plot) => (
      <MultiPolygon
        key={plot.id}
        polygon={plot.geometry}
        strokeWidth={theme.map.defaultStrokeWidth}
        strokeColor="white"
        fillColor={hexToRgba(
          theme.map.defaultFillColor,
          theme.map.defaultFillAlpha,
        )}
      />
    ));

    return (
      <>
        {plotPolygons}
        {/* Show drawn polygon when in select mode */}
        {newPolygon && drawingAction === "select" ? (
          <>
            <MultiPolygon
              polygon={newPolygon.geometry}
              strokeWidth={theme.map.defaultStrokeWidth}
              strokeColor="white"
              fillColor={hexToRgba(
                theme.colors.success,
                theme.map.defaultFillAlpha,
              )}
              tappable
              onPress={onSelectPolygon}
            />
            <Marker
              coordinate={{
                longitude: newPolygon.centroid.coordinates[0],
                latitude: newPolygon.centroid.coordinates[1],
              }}
            >
              <Card style={{ padding: theme.spacing.s }}>
                <Subtitle style={{ fontSize: 14 }}>
                  {newPolygon.localId
                    ? `${newPolygon.localId} (${newPolygon.size / 100}a)`
                    : `${newPolygon.size / 100}a`}
                </Subtitle>
              </Card>
            </Marker>
          </>
        ) : null}
        <PolygonDrawingTool
          initialAction="draw"
          portalName="PlotsMapPortal"
          ref={polygonDrawingToolRef}
          onDrawActionChange={(action) => {
            dispatch({ type: "SET_CREATE_ACTION", action });
          }}
          magnifierMapContent={plotPolygons}
          onFinish={onFinishDrawing}
          onInfo={() =>
            navigation.navigate("MapDrawOnboarding", { variant: "draw" })
          }
        />
      </>
    );
  },
);
