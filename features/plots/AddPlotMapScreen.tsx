import { Button } from "@/components/buttons/Button";
import { MaterialCommunityIconButton } from "@/components/buttons/IconButton";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { Checkbox } from "@/components/inputs/Checkbox";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import {
  DrawAction,
  PolygonDrawingTool,
  PolygonDrawingToolActions,
} from "@/components/map/PolygonDrawingTool";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { AddPlotMapScreenProps } from "./navigation/plots-routes";
import { hexToRgba } from "@/theme/theme";
import { Subtitle, Title } from "@/theme/Typography";
import { GeoSpatials } from "@/utils/geo-spatials";
import { round } from "@/utils/math";
import { PortalHost } from "@gorhom/portal";
import * as turf from "@turf/turf";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LatLng, MapPressEvent, Marker, Region } from "react-native-maps";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { MapShowLocationToggle } from "../map/MapShowLocationToggle";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { useFarmPlotsQuery } from "./plots.hooks";
import { useTranslation } from "react-i18next";
import { usePlotsByLocationQuery } from "../federal-plots/federalPlots.hooks";
import { FederalFarmPlot } from "@/api/layers.api";
import { useAddPlotStore } from "./add-plots.store";

export function AddPlotMapScreen({ navigation }: AddPlotMapScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const frame = useSafeAreaFrame();
  const { farm } = useFarmQuery();
  const { plots } = useFarmPlotsQuery();
  const [mapVisible, setMapVisible] = useState(false);
  const [showModeSelect, setShowModeSelect] = useState(true);
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [showsUserLocation, setShowsUserLocation] = useState<boolean>(false);

  const [mode, setMode] = useState<"parcel" | "custom" | "none">("none");
  const [drawingAction, setDrawingAction] = useState<DrawAction>("select");

  const [newPolygon, setNewPolygon] = useState<{
    geometry: GeoJSON.MultiPolygon;
    centroid: GeoJSON.Point;
    size: number;
    usage?: number;
    localId?: string;
    cuttingDate?: string;
  } | null>(null);

  const polygonDrawingToolRef = useRef<PolygonDrawingToolActions>(null);

  const [currentRegion, setCurrentRegion] = useState<Region | null>(null);
  const [currentViewPoint, setCurrentViewPoint] = useState<LatLng>({
    latitude: 0,
    longitude: 0,
  });
  const { plots: federalPlots } = usePlotsByLocationQuery(
    { lat: currentViewPoint.latitude, lng: currentViewPoint.longitude },
    1,
    mode === "parcel" && currentViewPoint.latitude !== 0
  );

  const addPlotStore = useAddPlotStore();

  useEffect(() => {
    return () => {
      return addPlotStore.reset();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("transitionEnd", () => {
      setMapVisible(true);
    });

    return unsubscribe;
  }, [navigation]);

  const handleOnComplete = () => {
    if (newPolygon) {
      addPlotStore.setData(newPolygon);
      navigation.navigate("AddPlotSummary", {});
    }
  };

  const handleRegionChangeComplete = (region: Region) => {
    setCurrentRegion(region);
  };

  const handleLoadPlots = () => {
    if (currentRegion) {
      setCurrentViewPoint(GeoSpatials.getRegionCenter(currentRegion));
    }
  };

  const handleMapPress = (event: MapPressEvent) => {
    if (drawingAction === "draw") {
      event.stopPropagation();
      polygonDrawingToolRef.current?.drawToPoint(event.nativeEvent.coordinate);
    }
  };

  function handleModeSelect(mode: "parcel" | "custom") {
    setShowModeSelect(false);
    setShowModeInfo(true);
    setMode(mode);
    if (mode === "custom") {
      setDrawingAction("draw");
    }
    if (mode === "parcel" && currentRegion) {
      setCurrentViewPoint(GeoSpatials.getRegionCenter(currentRegion));
    }
  }

  function onFinishDrawing(coordinates: LatLng[]) {
    const polygon = GeoSpatials.latLngToMultiPolygon([coordinates]);
    const centroid = turf.centroid(polygon);
    const area = turf.area(polygon);
    setNewPolygon({
      geometry: polygon,
      centroid: centroid.geometry,
      size: round(area, 0),
    });
  }

  function onParcelSelect(parcel: FederalFarmPlot) {
    if (mode !== "parcel") {
      return;
    }

    const centroid = turf.centroid(parcel.geometry);
    const area = turf.area(parcel.geometry);
    setNewPolygon({
      geometry: parcel.geometry,
      centroid: centroid.geometry,
      size: round(area, 0),
      usage: parcel.usage ?? undefined,
      localId: parcel.localId ?? undefined,
      cuttingDate: parcel.cuttingDate ?? undefined,
    });
  }

  function onSelectPolygon() {
    // only allow custom drawn polygons, parcels are too complicated to edit (too many points)
    if (mode === "custom" && drawingAction === "select") {
      polygonDrawingToolRef.current?.editPolygon(
        //first polygon in multipolygon and polygon at positin 0 (rest are holes)
        newPolygon!.geometry.coordinates[0][0].map(([longitude, latitude]) => ({
          longitude,
          latitude,
        }))
      );
    }
  }
  const parcelPolygons = useMemo(() => {
    if (mode === "custom") {
      return null;
    }
    return federalPlots?.map((parcel) => {
      return (
        <MultiPolygon
          key={parcel.id}
          polygon={parcel.geometry}
          strokeWidth={theme.map.defaultStrokeWidth}
          strokeColor={"white"}
          fillColor={hexToRgba(theme.colors.accent, 0.5)}
          tappable
          onPress={() => {
            onParcelSelect(parcel);
          }}
        />
      );
    });
  }, [mode, federalPlots]);

  if (!farm || !plots) {
    return null;
  }
  const [longitude, latitude] = farm.location.coordinates;

  const initialRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.0015,
    longitudeDelta: 0.0015,
  };

  const plotPolygons = plots?.map((plot) => (
    <MultiPolygon
      key={plot.id}
      polygon={plot.geometry}
      strokeWidth={theme.map.defaultStrokeWidth}
      strokeColor={"white"}
      fillColor={hexToRgba(
        theme.map.defaultFillColor,
        theme.map.defaultFillAlpha
      )}
    />
  ));

  return (
    <ContentView headerVisible={false}>
      <MapView
        loading={!mapVisible}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        onPress={handleMapPress}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {!showModeSelect && mode === "parcel" ? parcelPolygons : null}
        {plotPolygons}
        {initialRegion ? (
          <HomeMarker
            latitude={initialRegion.latitude}
            longitude={initialRegion.longitude}
          />
        ) : null}
        {/*  show drawn or selected area / parcel, only drawn areas are editable */}
        {newPolygon && drawingAction === "select" ? (
          <>
            <MultiPolygon
              polygon={newPolygon.geometry}
              strokeWidth={theme.map.defaultStrokeWidth}
              strokeColor={"white"}
              fillColor={hexToRgba(
                theme.colors.success,
                theme.map.defaultFillAlpha
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
              <Card
                style={{
                  padding: theme.spacing.s,
                }}
              >
                <Subtitle style={{ fontSize: 14 }}>
                  {newPolygon.localId
                    ? `${newPolygon.localId} (${newPolygon.size / 100}a)`
                    : `${newPolygon.size / 100}a`}
                </Subtitle>
              </Card>
            </Marker>
          </>
        ) : null}
        {!showModeSelect && mode === "custom" ? (
          <PolygonDrawingTool
            initialAction="draw"
            portalName="PlotsMap"
            ref={polygonDrawingToolRef}
            onDrawActionChange={(action) => {
              setDrawingAction(action);
            }}
            magnifierMapContent={plotPolygons}
            onFinish={onFinishDrawing}
          />
        ) : null}
      </MapView>
      {mode === "parcel" ? (
        <Button
          title="Parzellen laden"
          type="secondary"
          style={{ position: "absolute", bottom: 150, right: theme.spacing.m }}
          onPress={() => handleLoadPlots()}
        />
      ) : null}
      <PortalHost name="PlotsMap" />
      {mapVisible ? (
        <MapShowLocationToggle onShowLocationChange={setShowsUserLocation} />
      ) : null}
      <TopLeftBackButton />
      {showModeSelect ? (
        <Card
          style={{
            position: "absolute",
            top: frame.height / 2 - 100,
            left: theme.spacing.m,
            right: theme.spacing.m,
          }}
        >
          <Title>{t("plots.add.map.mode_select.message")}</Title>
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
              title={t("buttons.parcel_select")}
              onPress={() => handleModeSelect("parcel")}
            />
            <Button
              type="accent"
              fontSize={17}
              title={t("buttons.draw_area")}
              onPress={() => handleModeSelect("custom")}
            />
          </View>
        </Card>
      ) : null}
      {showModeInfo && mode === "parcel" ? <ParcelSelectTipp /> : null}

      {showModeInfo && mode === "custom" ? <DrawingTipp /> : null}

      <BottomActionContainer floating>
        <Button
          disabled={!newPolygon}
          title={t("buttons.next")}
          onPress={handleOnComplete}
        />
      </BottomActionContainer>
    </ContentView>
  );
}
function ParcelSelectTipp() {
  const { t } = useTranslation();
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const theme = useTheme();
  const frame = useSafeAreaFrame();
  const [showTip, setShowTip] = useState(
    localSettings.addPlotMapShowParcelSelectTip
  );

  const [visible, setVisible] = useState(
    localSettings.addPlotMapShowParcelSelectTip
  );

  if (!visible) {
    return null;
  }

  function onDone() {
    if (!showTip) {
      updateLocalSettings("addPlotMapShowParcelSelectTip", false);
    }
    setVisible(false);
  }
  return (
    <Card
      style={{
        position: "absolute",
        top: frame.height / 2 - 100,
        left: theme.spacing.m,
        right: theme.spacing.m,
      }}
    >
      <Title>{t("plots.add.map.tips.parcel_select.heading")}</Title>
      <View style={{ marginTop: theme.spacing.m }}>
        <Subtitle>
          {t("plots.add.map.tips.parcel_select.overlap_info")}
        </Subtitle>
      </View>
      <View style={{ marginTop: theme.spacing.l }}>
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.m,
            justifyContent: "center",
            marginBottom: theme.spacing.m,
          }}
        >
          <Subtitle>{t("common.dont_show_again")}</Subtitle>
          <Checkbox
            checked={!showTip}
            onPress={() => {
              setShowTip((prev) => !prev);
            }}
          />
        </View>

        <Button fontSize={16} title={t("buttons.ok")} onPress={onDone} />
      </View>
    </Card>
  );
}

function DrawingTipp() {
  const { t } = useTranslation();
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const theme = useTheme();
  const frame = useSafeAreaFrame();
  const [showTip, setShowTip] = useState(
    localSettings.addPlotMapShowDrawingTip
  );

  const [visible, setVisible] = useState(
    localSettings.addPlotMapShowDrawingTip
  );

  if (!visible) {
    return null;
  }

  function onDone() {
    if (!showTip) {
      updateLocalSettings("addPlotMapShowDrawingTip", false);
    }
    setVisible(false);
  }
  return (
    <Card
      style={{
        position: "absolute",
        top: frame.height / 2 - 200,
        left: theme.spacing.m,
        right: theme.spacing.m,
      }}
    >
      <Title>{t("plots.add.map.tips.draw_area.heading")}</Title>
      <View style={{ marginTop: theme.spacing.m }}>
        <Subtitle style={{ marginBottom: theme.spacing.s }}>
          {t("plots.add.map.tips.draw_area.drawing_info")}
        </Subtitle>
        <View
          style={{
            // flexDirection: "row",
            gap: theme.spacing.m,
            justifyContent: "center",
          }}
        >
          <Subtitle>{t("plots.add.map.tips.draw_area.finish")}</Subtitle>
          <MaterialCommunityIconButton
            style={{
              width: 45,
              backgroundColor: "white",
              alignSelf: "center",
            }}
            type="accent"
            color="black"
            iconSize={30}
            icon="check"
          />
        </View>
      </View>
      <View style={{ marginTop: theme.spacing.m }}>
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.m,
            justifyContent: "center",
            marginBottom: theme.spacing.m,
          }}
        >
          <Subtitle>{t("common.dont_show_again")}</Subtitle>
          <Checkbox
            checked={!showTip}
            onPress={() => {
              setShowTip((prev) => !prev);
            }}
          />
        </View>

        <Button fontSize={16} title={t("buttons.ok")} onPress={onDone} />
      </View>
    </Card>
  );
}
