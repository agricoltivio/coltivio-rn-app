import { Meadow } from "@/api/meadows.api";
import { Plot } from "@/api/plots.api";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H3 } from "@/theme/Typography";
import { round } from "@/utils/math";
import { type CameraRef } from "@maplibre/maplibre-react-native";
import * as turf from "@turf/turf";
import Fuse from "fuse.js";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, SectionList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { PlotsEmptyState } from "../PlotsEmptyState";

type PlotListModalProps = {
  visible: boolean;
  onClose: () => void;
  plots: Plot[];
  onSelectPlot: (plot: Plot) => void;
  cameraRef: React.RefObject<CameraRef | null>;
  // Main map: the list follows the visible layers. Plots show unless showPlots is false;
  // meadows show when given.
  showPlots?: boolean;
  meadows?: Meadow[];
  onSelectMeadow?: (meadow: Meadow) => void;
};

type ListEntry =
  | { kind: "plot"; plot: Plot & { usageName: string } }
  | { kind: "meadow"; meadow: Meadow };

export function PlotListModal({
  visible,
  onClose,
  plots,
  onSelectPlot,
  cameraRef,
  showPlots = true,
  meadows,
  onSelectMeadow,
}: PlotListModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchText, setSearchText] = useState("");

  const sanitizedPlots: Array<Plot & { usageName: string }> =
    plots?.map((plot) => ({
      ...plot,
      usageName: plot.usage
        ? //@ts-ignore
          t(`plots.usage_codes.${plot.usage}`)
        : t("common.unknown"),
    })) ?? [];

  const fuse = new Fuse(sanitizedPlots, {
    minMatchCharLength: 1,
    keys: [
      "name",
      "localId",
      "usage",
      "usageName",
      "currentCropRotation.crop.name",
    ],
  });

  let searchResult = sanitizedPlots;
  if (searchText.length > 0) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const meadowFuse = new Fuse(meadows ?? [], {
    minMatchCharLength: 1,
    keys: ["name"],
  });
  const meadowResult =
    searchText.length > 0
      ? meadowFuse.search(searchText).map((result) => result.item)
      : (meadows ?? []).slice().sort((a, b) => a.name.localeCompare(b.name));

  const showMeadows = meadows !== undefined;
  const sections: { title: string; data: ListEntry[] }[] = [
    ...(showPlots
      ? [
          {
            title: t("plots.plots"),
            data: searchResult.map(
              (plot): ListEntry => ({ kind: "plot", plot }),
            ),
          },
        ]
      : []),
    ...(showMeadows
      ? [
          {
            title: t("animals.meadows.meadows"),
            data: meadowResult.map(
              (meadow): ListEntry => ({ kind: "meadow", meadow }),
            ),
          },
        ]
      : []),
  ];

  const handleMeadowSelect = useCallback(
    (meadow: Meadow) => {
      onClose();
      setSearchText("");
      onSelectMeadow?.(meadow);
      const [longitude, latitude] = turf.centroid(meadow.geometry).geometry
        .coordinates;
      cameraRef.current?.flyTo({
        center: [longitude, latitude],
        duration: 500,
      });
    },
    [onSelectMeadow, cameraRef, onClose],
  );

  const handlePlotSelect = useCallback(
    (plot: Plot) => {
      onClose();
      setSearchText("");
      onSelectPlot(plot);
      // Only fly to centroid if the plot has geometry (size-0 plots have empty coordinates)
      if (plot.size > 0 && plot.geometry.coordinates.length > 0) {
        const centroid = turf.centroid(plot.geometry);
        const [longitude, latitude] = centroid.geometry.coordinates;
        cameraRef.current?.flyTo({
          center: [longitude, latitude],
          duration: 500,
        });
      }
    },
    [onSelectPlot, cameraRef, onClose],
  );

  const renderPlot = useCallback(
    (plot: Plot & { usageName: string }) => (
      <ListItem key={plot.id} onPress={() => handlePlotSelect(plot)}>
        <ListItem.Content>
          <View style={{ flexDirection: "row" }}>
            <ListItem.Title numberOfLines={1} style={{ flex: 1 }}>
              {plot.name}
            </ListItem.Title>
            <ListItem.Body> ({plot.size / 100}a)</ListItem.Body>
          </View>
          <ListItem.Body>
            {t("crops.crop")}:{" "}
            {plot.currentCropRotation?.crop.name ?? t("crops.no_crop")}
          </ListItem.Body>
          {plot.localId ? (
            <ListItem.Body>
              {t("forms.labels.local_id")}: {plot.localId}
            </ListItem.Body>
          ) : null}
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [handlePlotSelect],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListEntry }) =>
      item.kind === "plot" ? (
        renderPlot(item.plot)
      ) : (
        <ListItem
          key={item.meadow.id}
          onPress={() => handleMeadowSelect(item.meadow)}
        >
          <ListItem.Content>
            <View style={{ flexDirection: "row" }}>
              <ListItem.Title numberOfLines={1} style={{ flex: 1 }}>
                {item.meadow.name}
              </ListItem.Title>
              <ListItem.Body>
                {" "}
                ({round(item.meadow.size / 100, 1)}a)
              </ListItem.Body>
            </View>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      ),
    [renderPlot, handleMeadowSelect],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{
          flex: 1,
          paddingTop: theme.spacing.m,
          paddingHorizontal: theme.spacing.m,
          backgroundColor: theme.colors.background,
        }}
      >
        <View style={{ marginBottom: theme.spacing.m }}>
          <TextInput
            hideLabel
            placeholder={t("forms.placeholders.search")}
            onChangeText={setSearchText}
            value={searchText}
          />
        </View>
        <SectionList
          contentContainerStyle={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
          sections={sections}
          keyExtractor={(item) =>
            item.kind === "plot" ? item.plot.id : item.meadow.id
          }
          renderItem={renderItem}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <H3
              style={{
                paddingHorizontal: theme.spacing.m,
                paddingTop: theme.spacing.m,
                paddingBottom: theme.spacing.xs,
                backgroundColor: theme.colors.background,
              }}
            >
              {section.title}
            </H3>
          )}
          ListEmptyComponent={
            showPlots && !showMeadows && plots.length === 0 ? (
              <PlotsEmptyState />
            ) : null
          }
        />
      </SafeAreaView>
    </Modal>
  );
}
