import * as turf from "@turf/turf";
import { Plot } from "@/api/plots.api";
import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { Button } from "@/components/buttons/Button";
import {
  IonIconButton,
  MaterialCommunityIconButton,
} from "@/components/buttons/IconButton";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";
import { useTheme } from "styled-components/native";
import { useFarmQuery } from "../farms/farms.hooks";
import { MapShowLocationToggle } from "../map/MapShowLocationToggle";
import { MapControls } from "../map/overlays/MapControls";
import { TopLeftBackButton } from "../map/TopLeftBackButton";
import { useLocalSettings } from "../user/LocalSettingsContext";
import { PlotsMapScreenProps } from "./navigation/plots-routes";
import { useDeletePlotMutation, useFarmPlotsQuery } from "./plots.hooks";
import RnMapView, { Region } from "react-native-maps";
import { InsetsProps } from "@/constants/Screen";

export function PlotsMapScreen({ navigation, route }: PlotsMapScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const snapPoints = useMemo(() => [200, "85%"], []);
  const regionRef = useRef<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0025,
    longitudeDelta: 0.0025,
  });

  const selectedPlot = plots?.find((plot) => plot.id === selectedPlotId);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setMapVisible(true);
      // Show onboarding on first visit
      if (!localSettings.plotsMapOnboardingCompleted) {
        navigation.navigate("PlotsMapOnboarding");
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

  // Sync selectedPlotId from route params (e.g. when navigating back from PlotList)
  useEffect(() => {
    if (preselectedPlotId) {
      setSelectedPlotId(preselectedPlotId);
      // Animate map to the selected plot
      const plot = plots?.find((p) => p.id === preselectedPlotId);
      if (plot && plot.geometry.coordinates.length > 0) {
        const centroid = turf.centroid(plot.geometry);
        const [lng, lat] = centroid.geometry.coordinates;
        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: regionRef.current.latitudeDelta,
          longitudeDelta: regionRef.current.longitudeDelta,
        });
      }
      handleExpandBottomDrawer();
    }
  }, [preselectedPlotId]);

  function onPlotSelect(plot: Plot) {
    if (selectedPlotId === plot.id) {
      handleDismissBottomDrawer();
      setSelectedPlotId(null);
    } else {
      const currentRegion = regionRef?.current;
      const centroid = turf.centroid(plot.geometry);
      const [longitude, latitude] = centroid.geometry.coordinates;
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: currentRegion.latitudeDelta,
        longitudeDelta: currentRegion.longitudeDelta,
      });
      setSelectedPlotId(plot.id);
      handleExpandBottomDrawer();
      bottomSheetModalRef.current?.snapToIndex(0);
    }
  }

  // Delete mutation — clears selection on success
  const deletePlotMutation = useDeletePlotMutation(
    () => {
      setSelectedPlotId(null);
      handleDismissBottomDrawer();
      setDeleteDialogVisible(false);
    },
    (error) => console.error(error),
  );

  if (!farm || !plots) {
    return null;
  }

  const hasSelection = !!selectedPlot;

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
        loading={!mapVisible || plotsLoading}
        style={{
          ...StyleSheet.absoluteFillObject,
        }}
        onRegionChangeComplete={(region) => {
          regionRef.current = region;
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
      <TopLeftBackButton onPress={() => navigation.popTo("Home")} />

      {/* Plot list button — below location toggle on the left side */}
      <PlotListButtonContainer insets={insets}>
        <IonIconButton
          type="accent"
          color={theme.colors.black}
          iconSize={30}
          onPress={() => navigation.navigate("PlotList")}
          icon="list"
        />
      </PlotListButtonContainer>

      {/* Map controls sidebar (right side) */}
      <MapControls initiallyExpanded={!!preselectedPlotId}>
        <MaterialCommunityIconButton
          style={{
            backgroundColor: theme.colors.accent,
            opacity: !hasSelection ? 1 : 0.4,
          }}
          type="accent"
          color="black"
          iconSize={30}
          icon="pencil-plus-outline"
          disabled={hasSelection}
          onPress={() =>
            navigation.navigate("AddPlotMap", {
              initialRegion: regionRef.current,
            })
          }
        />
        <MaterialCommunityIconButton
          style={{
            backgroundColor: theme.colors.accent,
            opacity: hasSelection ? 1 : 0.4,
          }}
          type="accent"
          color="black"
          iconSize={30}
          icon="scissors-cutting"
          disabled={!hasSelection}
          onPress={() =>
            navigation.navigate("SplitPlotMap", {
              plotId: selectedPlot!.id,
              initialRegion: regionRef.current,
            })
          }
        />
        <MaterialCommunityIconButton
          style={{
            backgroundColor: theme.colors.accent,
            opacity: hasSelection ? 1 : 0.4,
          }}
          type="accent"
          color="black"
          iconSize={30}
          icon="table-merge-cells"
          disabled={!hasSelection}
          onPress={() =>
            navigation.navigate("MergePlotsMap", {
              plotId: selectedPlot!.id,
              initialRegion: regionRef.current,
            })
          }
        />
        <MaterialCommunityIconButton
          style={{
            backgroundColor: theme.colors.accent,
            opacity: hasSelection ? 1 : 0.4,
          }}
          type="accent"
          color="black"
          iconSize={30}
          icon="vector-square-edit"
          disabled={!hasSelection}
          onPress={() =>
            navigation.navigate("EditPlotMap", {
              plotId: selectedPlot!.id,
              initialRegion: regionRef.current,
            })
          }
        />
        <MaterialCommunityIconButton
          style={{
            backgroundColor: theme.colors.accent,
            opacity: hasSelection ? 1 : 0.4,
          }}
          type="accent"
          color="red"
          iconSize={30}
          icon="delete-outline"
          disabled={!hasSelection}
          onPress={() => setDeleteDialogVisible(true)}
        />
        <MaterialCommunityIconButton
          style={{ backgroundColor: theme.colors.accent }}
          type="accent"
          color="black"
          iconSize={30}
          icon="information-outline"
          onPress={() => navigation.navigate("PlotsMapOnboarding")}
        />
      </MapControls>

      {/* Bottom drawer with plot details */}
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
                {/* Area row */}
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
                {selectedPlot.usage && (
                  <SummaryItem
                    label={t("forms.labels.usagecode")}
                    value={selectedPlot.usage}
                  />
                )}
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

      {/* Delete plot confirmation dialog */}
      {selectedPlot && (
        <Modal
          visible={deleteDialogVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteDialogVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => setDeleteDialogVisible(false)}
          >
            <View
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 12,
                width: "80%",
                padding: theme.spacing.l,
              }}
            >
              <H3>{t("plots.delete.heading", { name: selectedPlot.name })}</H3>
              <Body style={{ marginTop: theme.spacing.m }}>
                {t("plots.delete.entries_warning")}
              </Body>
              <View
                style={{
                  flexDirection: "row",
                  gap: theme.spacing.m,
                  marginTop: theme.spacing.l,
                }}
              >
                <Button
                  style={{ flex: 1 }}
                  type="accent"
                  fontSize={15}
                  title={t("buttons.cancel")}
                  onPress={() => setDeleteDialogVisible(false)}
                />
                <Button
                  style={{ flex: 1 }}
                  type="danger"
                  fontSize={15}
                  title={t("buttons.delete")}
                  onPress={() => deletePlotMutation.mutate(selectedPlot.id)}
                  loading={deletePlotMutation.isPending}
                  disabled={deletePlotMutation.isPending}
                />
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
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

const PlotListButtonContainer = styled.View<InsetsProps>`
  position: absolute;
  left: ${({ theme }) => theme.spacing.m}px;
  top: ${({ insets, theme }) => insets.top + theme.spacing.s + 100}px;
  align-items: center;
`;
