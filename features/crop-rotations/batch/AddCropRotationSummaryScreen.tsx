import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { MapView } from "@/components/map/Map";
import { MultiPolygon } from "@/components/map/MultiPolygon";
import { ScrollView } from "@/components/views/ScrollView";
import { hexToRgba } from "@/theme/theme";
import { H2, H3 } from "@/theme/Typography";
import * as turf from "@turf/turf";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { Region } from "react-native-maps";
import { useTheme } from "styled-components/native";
import {
  useCreateCropRotationsByCropMutation,
  useCropRotationsByPlotIdsQuery,
} from "../crop-rotations.hooks";
import { useCreateCropRotationStore } from "./crop-rotations.store";
import { AddCropRotationSummaryScreenProps } from "../navigation/crop-rotations-routes";
import { Card } from "@/components/card/Card";
import { useTranslation } from "react-i18next";
import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";
import { PlotCropRotation } from "@/api/crop-rotations.api";
import {
  dateStringToDate,
  dateToDateString,
  formatLocalizedDate,
  INFINITE_DATE,
} from "@/utils/date";
import { locale } from "@/locales/i18n";

/** Returns true if the existing rotation is "permanent" (toDate is INFINITE_DATE) */
function isPermanentRotation(rotation: PlotCropRotation): boolean {
  if (!rotation.toDate) return false;
  const toDate = new Date(rotation.toDate);
  return toDate.getFullYear() >= INFINITE_DATE.getFullYear();
}

/** Returns the most recent rotation for a given plot, sorted by fromDate descending. */
function getLastRotationForPlot(
  rotations: PlotCropRotation[] | undefined,
  plotId: string,
): PlotCropRotation | undefined {
  if (!rotations) return undefined;
  return rotations
    .filter((r) => r.plotId === plotId)
    .sort(
      (a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime(),
    )[0];
}

function formatRotationDate(dateString: string): string {
  const date = new Date(dateString);
  if (date.getFullYear() >= INFINITE_DATE.getFullYear()) return "∞";
  return formatLocalizedDate(date, locale);
}

/**
 * Checks whether [newFrom, newTo] overlaps with any non-permanent rotation for a given plot.
 * Permanent rotations (toDate = INFINITE_DATE) are excluded because the backend auto-adjusts them.
 */
function getOverlappingRotations(
  existingRotations: PlotCropRotation[],
  plotId: string,
  newFrom: string,
  newTo: string,
): PlotCropRotation[] {
  const plotRotations = existingRotations.filter(
    (r) => r.plotId === plotId && !isPermanentRotation(r),
  );
  if (plotRotations.length === 0) return [];

  const newFromTime = dateStringToDate(newFrom).getTime();
  // If no toDate specified, treat it as a single-day range
  const newToTime = dateStringToDate(newTo).getTime();

  return plotRotations.filter((rotation) => {
    const existingFrom = new Date(rotation.fromDate).getTime();
    const existingTo = new Date(rotation.toDate).getTime();
    // Two ranges overlap if one starts before the other ends and vice versa
    return newFromTime <= existingTo && newToTime >= existingFrom;
  });
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
      <Text style={{ flex: 1, fontWeight: 600, fontSize: 18 }}>{label}</Text>
      <Text style={{ fontSize: 18 }}>{value}</Text>
    </View>
  );
}

export function AddCropRotationSummaryScreen({
  navigation,
}: AddCropRotationSummaryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    selectedPlotsById,
    selectedCrop,
    cropId,
    plotDatesById,
    setPlotDate,
  } = useCreateCropRotationStore();

  const selectedPlots = Object.values(selectedPlotsById);
  const plotIds = selectedPlots.map((p) => p.plotId);

  // Fetch existing rotations for validation
  const { plotCropRotations } = useCropRotationsByPlotIdsQuery(plotIds, false);

  const createCropRotationsMutation = useCreateCropRotationsByCropMutation(() =>
    navigation.reset({
      index: 1,
      routes: [
        { name: "Home" },
        { name: "FieldCalendar" },
        { name: "CropRotations" },
      ],
    }),
  );

  const plotsWithDates = selectedPlots.map((plot) => ({
    ...plot,
    fromDate: plotDatesById[plot.plotId]?.fromDate,
    toDate: plotDatesById[plot.plotId]?.toDate,
  }));

  // Overlap validation per plot
  const overlappingPlotIds = useMemo(() => {
    if (!plotCropRotations) return new Set<string>();
    const overlapping = new Set<string>();
    for (const [plotId, dates] of Object.entries(plotDatesById)) {
      if (!dates.fromDate || !dates.toDate) continue;
      const overlaps = getOverlappingRotations(
        plotCropRotations,
        plotId,
        dates.fromDate,
        dates.toDate,
      );
      if (overlaps.length > 0) {
        overlapping.add(plotId);
      }
    }
    return overlapping;
  }, [plotCropRotations, plotDatesById]);

  const hasOverlaps = overlappingPlotIds.size > 0;

  const centroid = turf.centroid(selectedPlots[0].geometry);
  const [longitude, latitude] = centroid.geometry.coordinates;
  const initialRegion: Region = {
    latitude,
    longitude,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  };

  function onSave() {
    if (!cropId) return;
    createCropRotationsMutation.mutate({
      cropId,
      plots: plotsWithDates.map((plot) => ({
        plotId: plot.plotId,
        cropId: cropId,
        fromDate: plot.fromDate,
        toDate: plot.fromDate,
      })),
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={onSave}
            disabled={createCropRotationsMutation.isPending || hasOverlaps}
            loading={createCropRotationsMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={selectedCrop?.name ?? ""}
      >
        <H2>{t("crop_rotations.crop_rotation")}</H2>
        <H3>{selectedCrop?.name}</H3>

        {/* Map preview */}
        <View
          style={{
            height: 250,
            borderRadius: 10,
            overflow: "hidden",
            marginTop: theme.spacing.m,
          }}
        >
          <MapView initialRegion={initialRegion} liteMode>
            {selectedPlots.map((plot) => (
              <MultiPolygon
                key={plot.plotId}
                polygon={plot.geometry}
                strokeWidth={theme.map.defaultStrokeWidth}
                strokeColor={"white"}
                fillColor={hexToRgba(
                  theme.map.defaultFillColor,
                  theme.map.defaultFillAlpha,
                )}
              />
            ))}
          </MapView>
        </View>

        {/* Crop info */}
        <Card style={{ marginTop: theme.spacing.m }}>
          <SummaryItem
            label={t("forms.labels.crop")}
            value={selectedCrop?.name!}
          />
          {selectedCrop?.variety ? (
            <SummaryItem
              label={t("forms.labels.kind")}
              value={selectedCrop.variety}
            />
          ) : null}
        </Card>

        {/* Per-plot date list */}
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.s }}>
          {plotsWithDates.map((plot) => {
            const hasOverlap = overlappingPlotIds.has(plot.plotId);
            const lastRotation = getLastRotationForPlot(
              plotCropRotations,
              plot.plotId,
            );
            return (
              <Card
                key={plot.plotId}
                style={
                  hasOverlap
                    ? { borderColor: theme.colors.error, borderWidth: 1 }
                    : undefined
                }
              >
                <Text
                  style={{
                    fontWeight: 600,
                    fontSize: 16,
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {plot.name}
                </Text>
                {lastRotation && (
                  <Text
                    style={{
                      fontSize: 13,
                      color: theme.colors.gray2,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {t("crop_rotations.last_rotation", {
                      crop: lastRotation.crop.name,
                      from: formatRotationDate(lastRotation.fromDate),
                      to: formatRotationDate(lastRotation.toDate),
                    })}
                  </Text>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.m,
                    flexWrap: "wrap",
                  }}
                >
                  <CompactDatePicker
                    label={t("forms.labels.from")}
                    date={
                      plot.fromDate
                        ? dateStringToDate(plot.fromDate)
                        : new Date()
                    }
                    onDateChange={(date) => {
                      setPlotDate(
                        plot.plotId,
                        dateToDateString(date),
                        plot.toDate,
                      );
                    }}
                  />
                  <CompactDatePicker
                    label={t("forms.labels.to")}
                    date={
                      plot.toDate ? dateStringToDate(plot.toDate) : new Date()
                    }
                    onDateChange={(date) => {
                      setPlotDate(
                        plot.plotId,
                        plot.fromDate,
                        dateToDateString(date),
                      );
                    }}
                  />
                </View>
                {hasOverlap && (
                  <Text
                    style={{
                      color: theme.colors.error,
                      fontSize: 13,
                      marginTop: theme.spacing.xs,
                    }}
                  >
                    {t("crop_rotations.overlap_warning")}
                  </Text>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </ContentView>
  );
}
