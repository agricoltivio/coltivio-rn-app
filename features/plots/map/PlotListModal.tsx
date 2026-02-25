import { Plot } from "@/api/plots.api";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { H2 } from "@/theme/Typography";
import * as turf from "@turf/turf";
import Fuse from "fuse.js";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Modal, View } from "react-native";
import RnMapView from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

type PlotListModalProps = {
  visible: boolean;
  onClose: () => void;
  plots: Plot[];
  onSelectPlot: (plot: Plot) => void;
  mapRef: React.RefObject<RnMapView | null>;
};

export function PlotListModal({
  visible,
  onClose,
  plots,
  onSelectPlot,
  mapRef,
}: PlotListModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
    keys: ["name", "usage", "usageName", "cropRotations[0].crop.name"],
  });

  let searchResult = sanitizedPlots;
  if (searchText.length > 0) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  const handlePlotSelect = useCallback(
    (plot: Plot) => {
      onClose();
      setSearchText("");
      onSelectPlot(plot);
      // Animate map to plot centroid
      const centroid = turf.centroid(plot.geometry);
      const [longitude, latitude] = centroid.geometry.coordinates;
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.0025,
      });
    },
    [onSelectPlot, mapRef, onClose],
  );

  const renderItem = useCallback(
    ({ item: plot }: { item: Plot & { usageName: string } }) => (
      <ListItem key={plot.id} onPress={() => handlePlotSelect(plot)}>
        <ListItem.Content>
          <ListItem.Title style={{ flex: 1 }}>{plot.name}</ListItem.Title>
          <ListItem.Body>
            {plot.currentCropRotation?.crop.name} ({plot.size / 100}a)
          </ListItem.Body>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ),
    [handlePlotSelect],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + theme.spacing.m,
          paddingHorizontal: theme.spacing.m,
          backgroundColor: theme.colors.background,
        }}
      >
        <H2>{t("plots.plots")}</H2>
        <View style={{ marginVertical: theme.spacing.m }}>
          <TextInput
            hideLabel
            placeholder={t("forms.placeholders.search")}
            onChangeText={setSearchText}
            value={searchText}
          />
        </View>
        <FlatList
          contentContainerStyle={{
            borderTopRightRadius: 10,
            borderTopLeftRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
          data={searchResult}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      </View>
    </Modal>
  );
}
