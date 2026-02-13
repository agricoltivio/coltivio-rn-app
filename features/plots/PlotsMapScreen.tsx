import * as turf from "@turf/turf";
import { Plot } from "@/api/plots.api";
import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { Button } from "@/components/buttons/Button";
import { FAB } from "@/components/buttons/FAB";
import { Card } from "@/components/card/Card";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { HomeMarker } from "@/features/map/layers/HomeMarker";
import { locale } from "@/locales/i18n";
import { hexToRgba } from "@/theme/theme";
import { Body, H3, Label } from "@/theme/Typography";
import { formatLocalizedDate } from "@/utils/date";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { MapShowLocationToggle } from "../map/MapShowLocationToggle";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { PlotsMapScreenProps } from "./navigation/plots-routes";
import { useFarmPlotsQuery } from "./plots.hooks";
import RnMapView, { Region } from "react-native-maps";

export function PlotsMapScreen({ navigation, route }: PlotsMapScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();
  const { plots, isFetching: plotsLoading } = useFarmPlotsQuery();
  const { localSettings } = useLocalSettings();
  const [mapVisible, setMapVisible] = useState(false);
  const mapRef = useRef<RnMapView>(null);
  const [showsUserLocation, setShowsUserLocation] = useState<boolean>(false);
  const preselectedPlotId = route.params?.selectedPlotId;
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(
    preselectedPlotId || null,
  );
  const [sheetIndex, setSheetIndex] = useState(0);
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const snapPoints = useMemo(() => [200, "85%"], []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMapVisible(true);
      // Show onboarding on first visit
      if (!localSettings.plotsMapOnboardingCompleted) {
        navigation.navigate("MapDrawOnboarding", { variant: "plotsMap" });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [navigation, localSettings.plotsMapOnboardingCompleted]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const handleExpandBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleDismissBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    if (index >= 0) setSheetIndex(index);
  }, []);

  navigation.addListener("focus", () => {
    if (selectedPlotId) {
      handleExpandBottomDrawer();
    }
  });

  function onPlotSelect(plot: Plot) {
    if (selectedPlotId === plot.id) {
      handleDismissBottomDrawer();
      setSelectedPlotId(null);
    } else {
      const centroid = turf.centroid(plot.geometry);
      const [longitude, latitude] = centroid.geometry.coordinates;
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      });
      setSelectedPlotId(plot.id);
      handleExpandBottomDrawer();
      bottomSheetModalRef.current?.snapToIndex(0);
    }
  }

  if (!farm || !plots) {
    return null;
  }

  const selectedPlot = plots?.find((plot) => plot.id === selectedPlotId);

  const initialRegion: Region = useMemo(() => {
    const preselectedPlot = plots.find((plot) => plot.id === preselectedPlotId);
    if (preselectedPlot && preselectedPlot.geometry.coordinates.length > 0) {
      const centroid = turf.centroid(preselectedPlot.geometry);
      const [longitude, latitude] = centroid.geometry.coordinates;
      return {
        latitude,
        longitude,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      };
    } else {
      return {
        latitude: farm.location.coordinates[1],
        longitude: farm.location.coordinates[0],
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      };
    }
  }, [plots, preselectedPlotId]);

  const plotPolygons = plots.map((plot) => (
    <MultiPolygon
      key={plot.id}
      polygon={plot.geometry}
      strokeWidth={theme.map.defaultStrokeWidth}
      strokeColor={"white"}
      fillColor={hexToRgba(
        plot.id === selectedPlot?.id
          ? theme.colors.success
          : theme.map.defaultFillColor,
        theme.map.defaultFillAlpha,
      )}
      tappable
      onPress={(event) => onPlotSelect(plot)}
    />
  ));

  return (
    <ContentView headerVisible={false}>
      <MapView
        ref={mapRef}
        loading={
          !mapVisible || plotsLoading
          // (preselectedPlotId != null && !selectedPlot)
        }
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
      >
        {plotPolygons}
        {initialRegion && (
          <HomeMarker
            latitude={farm.location.coordinates[1]}
            longitude={farm.location.coordinates[0]}
          />
        )}
      </MapView>
      <MapShowLocationToggle onShowLocationChange={setShowsUserLocation} />
      <TopLeftBackButton />
      <FAB
        icon={{ name: "add", color: "white" }}
        onPress={() => navigation.navigate("AddPlotMap")}
        color="blue"
      />
      <BottomSheetModalProvider>
        <BottomDrawerModal
          onClose={() => setSelectedPlotId(null)}
          ref={bottomSheetModalRef}
          backdropDisappearsOnIndex={0}
          snapPoints={snapPoints}
          onChange={handleSheetChange}
        >
          {/* Header with expand toggle */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <H3>{t("plots.plot_name", { name: selectedPlot?.name })}</H3>
            </View>
            <Pressable
              onPress={() => {
                bottomSheetModalRef.current?.snapToIndex(
                  sheetIndex === 1 ? 0 : 1,
                );
              }}
            >
              <Ionicons
                name={sheetIndex === 1 ? "chevron-down" : "chevron-up"}
                size={24}
                color={theme.colors.gray2}
              />
            </Pressable>
          </View>

          {/* Detail content */}
          {selectedPlot && (
            <>
              <Card style={{ marginTop: theme.spacing.m }}>
                {/* Area row with inline edit icon */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: theme.spacing.s,
                    gap: theme.spacing.m,
                  }}
                >
                  <Label style={{ flex: 1 }}>{t("forms.labels.area")}</Label>
                  <Label style={{ fontSize: 18 }}>
                    {`${(selectedPlot.size ?? 0) / 100}a`}
                  </Label>
                  <Pressable
                    onPress={() => setAreaModalVisible(true)}
                    // style={{ padding: theme.spacing.xs }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      // color={theme.colors.gray2}
                    />
                  </Pressable>
                </View>
                {selectedPlot.currentCropRotation ? (
                  <SummaryItem
                    label={t("crops.crop")}
                    value={selectedPlot.currentCropRotation.crop.name}
                  />
                ) : null}
                <SummaryItem
                  label={t("forms.labels.local_id")}
                  value={selectedPlot.localId ?? t("common.unknown")}
                />
                {selectedPlot.cuttingDate ? (
                  <SummaryItem
                    label={t("forms.labels.cutting_date")}
                    value={formatLocalizedDate(
                      new Date(selectedPlot.cuttingDate),
                      locale,
                      "long",
                      false,
                    )}
                  />
                ) : null}
                {selectedPlot.additionalNotes ? (
                  <>
                    <Label style={{ marginTop: theme.spacing.m }}>
                      {t("forms.labels.additional_notes")}
                    </Label>
                    <Body>{selectedPlot.additionalNotes}</Body>
                  </>
                ) : null}
              </Card>

              <View
                style={{
                  marginTop: theme.spacing.m,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: theme.colors.white,
                }}
              >
                <ListItem
                  style={{ backgroundColor: theme.colors.white }}
                  onPress={() =>
                    navigation.navigate("PlanCropRotations", {
                      plotIds: [selectedPlot.id],
                      previousScreen: "PlotDetails",
                    })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                      {t("crop_rotations.crop_rotation")}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
                <ListItem
                  style={{ backgroundColor: theme.colors.white }}
                  onPress={() =>
                    navigation.navigate("PlotHarvests", {
                      plotId: selectedPlot.id,
                      name: selectedPlot.name,
                    })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                      {t("harvests.harvest")}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
                <ListItem
                  style={{ backgroundColor: theme.colors.white }}
                  onPress={() =>
                    navigation.navigate("PlotFertilizerApplications", {
                      plotId: selectedPlot.id,
                      name: selectedPlot.name,
                    })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                      {t("fertilizer_application.fertilizer_application")}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
                <ListItem
                  style={{ backgroundColor: theme.colors.white }}
                  onPress={() =>
                    navigation.navigate("PlotTillages", {
                      plotId: selectedPlot.id,
                      name: selectedPlot.name,
                    })
                  }
                >
                  <ListItem.Content>
                    <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                      {t("tillages.tillage")}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
                <ListItem
                  style={{ backgroundColor: theme.colors.white }}
                  onPress={() =>
                    navigation.navigate("PlotCropProtectionApplications", {
                      plotId: selectedPlot.id,
                      name: selectedPlot.name,
                    })
                  }
                  hideBottomDivider
                >
                  <ListItem.Content>
                    <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                      {t("crop_protection_applications.crop_protection")}
                    </ListItem.Title>
                  </ListItem.Content>
                  <ListItem.Chevron />
                </ListItem>
              </View>

              <Button
                style={{ marginTop: theme.spacing.m }}
                type="accent"
                title={t("buttons.edit")}
                onPress={() =>
                  navigation.navigate("EditPlot", {
                    plotId: selectedPlot.id,
                  })
                }
              />
            </>
          )}
        </BottomDrawerModal>
      </BottomSheetModalProvider>

      {/* Area edit actions modal */}
      <Modal
        visible={areaModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAreaModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setAreaModalVisible(false)}
        >
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              width: "80%",
              overflow: "hidden",
            }}
          >
            {selectedPlot && (
              <>
                <Pressable
                  style={{
                    padding: theme.spacing.m,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }}
                  onPress={() => {
                    setAreaModalVisible(false);
                    navigation.navigate("EditPlotMap", {
                      plotId: selectedPlot.id,
                    });
                  }}
                >
                  <Label style={{ fontSize: 16, textAlign: "center" }}>
                    {t("plots.actions.adjust_area")}
                  </Label>
                </Pressable>
                <Pressable
                  style={{
                    padding: theme.spacing.m,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                  }}
                  onPress={() => {
                    setAreaModalVisible(false);
                    navigation.navigate("SplitPlotMap", {
                      plotId: selectedPlot.id,
                    });
                  }}
                >
                  <Label style={{ fontSize: 16, textAlign: "center" }}>
                    {t("plots.actions.split")}
                  </Label>
                </Pressable>
                <Pressable
                  style={{ padding: theme.spacing.m }}
                  onPress={() => {
                    setAreaModalVisible(false);
                    navigation.navigate("MergePlotsMap", {
                      plotId: selectedPlot.id,
                    });
                  }}
                >
                  <Label style={{ fontSize: 16, textAlign: "center" }}>
                    {t("plots.actions.merge")}
                  </Label>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </ContentView>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        marginBottom: theme.spacing.s,
        gap: theme.spacing.m,
      }}
    >
      <Label style={{ flex: 1 }}>{label}</Label>
      <Label style={{ fontSize: 18 }}>{value}</Label>
    </View>
  );
}
