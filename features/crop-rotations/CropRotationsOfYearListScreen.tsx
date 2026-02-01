import { ContentView } from "@/components/containers/ContentView";
import { TextInput } from "@/components/inputs/TextInput";
import { ListItem } from "@/components/list/ListItem";
import { CropRotationsOfYearListScreenProps } from "./navigation/crop-rotations-routes";
import { H2 } from "@/theme/Typography";
import Fuse from "fuse.js";
import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropRotationsQuery } from "./crop-rotations.hooks";
import { locale } from "@/locales/i18n";
import { formatLocalizedDate } from "@/utils/date";
import { useTranslation } from "react-i18next";
import {
  ViewMode,
  ViewModeToggle,
} from "./components/ViewModeToggle";
import { CropFilterChips } from "./components/CropFilterChips";
import { CropRotationTimeline } from "./timeline/CropRotationTimeline";
import { buildTimelineData } from "./timeline/timeline-utils";

export function CropRotationsOfYearListScreen({
  route,
  navigation,
}: CropRotationsOfYearListScreenProps) {
  const { t } = useTranslation();
  const { year } = route.params;
  const theme = useTheme();
  const fromDate = new Date(year, 0, 1);
  const toDate = new Date(year + 1, 0, 1);
  const { cropRotations } = useCropRotationsQuery(fromDate, toDate);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCropNames, setSelectedCropNames] = useState<Set<string>>(
    new Set()
  );

  // Unique crop names sorted alphabetically for filter chips
  const uniqueCropNames = useMemo(() => {
    if (!cropRotations) return [];
    const names = new Set(cropRotations.map((cr) => cr.crop.name));
    return Array.from(names).sort();
  }, [cropRotations]);

  function handleToggleCrop(cropName: string) {
    setSelectedCropNames((prev) => {
      const next = new Set(prev);
      if (next.has(cropName)) {
        next.delete(cropName);
      } else {
        next.add(cropName);
      }
      return next;
    });
  }

  if (!cropRotations) {
    return null;
  }

  // Apply crop filter to raw rotations (used by both views)
  const filteredCropRotations =
    selectedCropNames.size === 0
      ? cropRotations
      : cropRotations.filter((cr) => selectedCropNames.has(cr.crop.name));

  // Build formatted list data for the list view
  const sanitizedCropRotations = filteredCropRotations.map((cropRotation) => ({
    ...cropRotation,
    fromDate: formatLocalizedDate(
      new Date(cropRotation.fromDate),
      locale,
      "long",
      false
    ),
    toDate: cropRotation.toDate
      ? formatLocalizedDate(new Date(cropRotation.toDate), locale)
      : undefined,
  }));

  const fuse = new Fuse(sanitizedCropRotations ?? [], {
    minMatchCharLength: 1,
    keys: ["fromDate", "toDate", "crop.name", "crop.category", "plot.name"],
  });

  let searchResult = sanitizedCropRotations;
  if (searchText) {
    searchResult = fuse.search(searchText).map((result) => result.item);
  }

  // Build timeline data from filtered rotations
  const timelinePlotData = buildTimelineData(filteredCropRotations, year);

  function handleBarPress(rotationId: string, plotName: string) {
    navigation.navigate("EditPlotCropRotation", {
      rotationId,
      plotName,
    });
  }

  const renderItem = ({
    item: cropRotation,
  }: {
    item: (typeof sanitizedCropRotations)[number];
  }) => (
    <ListItem
      key={cropRotation.id}
      onPress={() =>
        navigation.navigate("EditPlotCropRotation", {
          rotationId: cropRotation.id,
          plotName: cropRotation.plot.name,
        })
      }
    >
      <ListItem.Content>
        <ListItem.Title style={{ flex: 1 }}>
          {t("plots.plot_name_date", {
            name: cropRotation.plot.name,
            date: cropRotation.fromDate,
          })}
        </ListItem.Title>
        <ListItem.Body>{cropRotation.crop.name}</ListItem.Body>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
  );

  return (
    <ContentView headerVisible>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <H2 style={{ flex: 1 }}>
          {t("crop_rotations.crop_rotation_year", { year: route.params.year })}
        </H2>
        <ViewModeToggle viewMode={viewMode} onChangeViewMode={setViewMode} />
      </View>

      {/* Crop filter chips shown in both modes */}
      {uniqueCropNames.length > 1 && (
        <View style={{ marginTop: theme.spacing.s }}>
          <CropFilterChips
            cropNames={uniqueCropNames}
            selectedCropNames={selectedCropNames}
            onToggleCrop={handleToggleCrop}
          />
        </View>
      )}

      {viewMode === "list" ? (
        <>
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
        </>
      ) : (
        <View style={{ flex: 1, marginTop: theme.spacing.m }}>
          <CropRotationTimeline
            plotData={timelinePlotData}
            onBarPress={handleBarPress}
          />
        </View>
      )}
    </ContentView>
  );
}
