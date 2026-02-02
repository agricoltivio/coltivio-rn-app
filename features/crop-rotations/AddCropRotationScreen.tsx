import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { Card } from "@/components/card/Card";
import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";
import { Select } from "@/components/select/Select";
import { ScrollView } from "@/components/views/ScrollView";
import { AddCropRotationScreenProps } from "./navigation/crop-rotations-routes";
import { H2 } from "@/theme/Typography";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCropsQuery } from "../crops/crops.hooks";
import {
  useCreateCropRotationsByPlotMutation,
  useCropRotationsByPlotIdsQuery,
} from "./crop-rotations.hooks";
import { useTranslation } from "react-i18next";
import { formatLocalizedDate, INFINITE_DATE } from "@/utils/date";
import { locale } from "@/locales/i18n";
import { PlotCropRotation } from "@/api/crop-rotations.api";

type RotationEntry = {
  entryId: string;
  cropId: string;
  fromDate: Date;
  toDate: Date;
};

/** Returns true if the existing rotation is "permanent" (toDate is INFINITE_DATE) */
function isPermanentRotation(rotation: PlotCropRotation): boolean {
  if (!rotation.toDate) return false;
  return new Date(rotation.toDate).getTime() >= INFINITE_DATE.getTime();
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

function formatRotationDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (date.getTime() >= INFINITE_DATE.getTime()) return "∞";
  return formatLocalizedDate(date, locale);
}

/**
 * Checks whether [newFrom, newTo] overlaps with any non-permanent existing rotation for the plot.
 * Permanent rotations are excluded because the backend auto-adjusts them.
 */
function hasOverlapWithExisting(
  existingRotations: PlotCropRotation[],
  plotId: string,
  newFrom: Date,
  newTo: Date,
): boolean {
  const plotRotations = existingRotations.filter(
    (r) => r.plotId === plotId && !isPermanentRotation(r),
  );
  const newFromTime = newFrom.getTime();
  const newToTime = newTo.getTime();
  return plotRotations.some((rotation) => {
    const existingFrom = new Date(rotation.fromDate).getTime();
    const existingTo = new Date(rotation.toDate).getTime();
    return newFromTime <= existingTo && newToTime >= existingFrom;
  });
}

/**
 * Checks whether two entries overlap with each other.
 */
function entriesOverlap(entryA: RotationEntry, entryB: RotationEntry): boolean {
  return (
    entryA.fromDate.getTime() <= entryB.toDate.getTime() &&
    entryA.toDate.getTime() >= entryB.fromDate.getTime()
  );
}

function makeEntryId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function AddCropRotationScreen({
  navigation,
  route,
}: AddCropRotationScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { plotId } = route.params;
  const { crops } = useCropsQuery();

  // Fetch all existing rotations for this plot (not only current)
  const { plotCropRotations } = useCropRotationsByPlotIdsQuery([plotId], false);

  const lastRotation = useMemo(
    () => getLastRotationForPlot(plotCropRotations, plotId),
    [plotCropRotations, plotId],
  );
  const lastIsPermanent = lastRotation
    ? isPermanentRotation(lastRotation)
    : false;

  // Smart default: if last rotation is non-permanent, start the day after it ends
  const defaultFromDate = useMemo(() => {
    if (lastRotation && !lastIsPermanent) {
      return new Date(new Date(lastRotation.toDate).getTime() + 86400000);
    }
    return new Date();
  }, [lastRotation, lastIsPermanent]);

  const [entries, setEntries] = useState<RotationEntry[]>([
    {
      entryId: makeEntryId(),
      cropId: "",
      fromDate: defaultFromDate,
      toDate: defaultFromDate,
    },
  ]);

  const createMutation = useCreateCropRotationsByPlotMutation(() =>
    navigation.goBack(),
  );

  const cropSelectData = useMemo(
    () => crops?.map((crop) => ({ label: crop.name, value: crop.id })) ?? [],
    [crops],
  );

  // Validation: compute which entries have errors
  const entryErrors = useMemo(() => {
    const errorMap = new Map<string, string>();
    for (const entry of entries) {
      // Check overlap with existing rotations on this plot
      if (plotCropRotations && entry.cropId) {
        if (
          hasOverlapWithExisting(
            plotCropRotations,
            plotId,
            entry.fromDate,
            entry.toDate,
          )
        ) {
          errorMap.set(entry.entryId, t("crop_rotations.overlap_warning"));
          continue;
        }
      }
      // Check overlap between new entries themselves
      for (const other of entries) {
        if (other.entryId === entry.entryId) continue;
        if (!other.cropId) continue;
        if (entriesOverlap(entry, other)) {
          errorMap.set(entry.entryId, t("crop_rotations.overlap_warning"));
          break;
        }
      }
    }
    return errorMap;
  }, [entries, plotCropRotations, plotId, t]);

  const hasErrors = entryErrors.size > 0;
  const allEntriesHaveCrop = entries.every((e) => e.cropId !== "");

  function updateEntry(entryId: string, updates: Partial<RotationEntry>) {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.entryId === entryId ? { ...entry, ...updates } : entry,
      ),
    );
  }

  function removeEntry(entryId: string) {
    setEntries((prev) => prev.filter((e) => e.entryId !== entryId));
  }

  function addEntry() {
    // Default dates for a new entry: day after the last entry's toDate
    const lastEntry = entries[entries.length - 1];
    const newFromDate = lastEntry
      ? new Date(lastEntry.toDate.getTime() + 86400000)
      : defaultFromDate;
    setEntries((prev) => [
      ...prev,
      {
        entryId: makeEntryId(),
        cropId: "",
        fromDate: newFromDate,
        toDate: newFromDate,
      },
    ]);
  }

  function onSave() {
    createMutation.mutate({
      plotId,
      crops: entries.map((entry) => ({
        cropId: entry.cropId,
        fromDate: entry.fromDate.toISOString(),
        toDate: entry.toDate.toISOString(),
      })),
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            onPress={onSave}
            title={t("buttons.save")}
            style={{ flexGrow: 1 }}
            disabled={
              !allEntriesHaveCrop || hasErrors || createMutation.isPending
            }
            loading={createMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={t("crop_rotations.new_crop")}
      >
        <H2>{t("crop_rotations.new_crop")}</H2>

        {/* Last rotation info */}
        {lastRotation && (
          <View style={{ marginTop: theme.spacing.s }}>
            <Text
              style={{
                fontSize: 13,
                color: theme.colors.gray2,
              }}
            >
              {lastIsPermanent
                ? t("crop_rotations.last_rotation_permanent", {
                    crop: lastRotation.crop.name,
                    from: formatRotationDate(lastRotation.fromDate),
                  })
                : t("crop_rotations.last_rotation", {
                    crop: lastRotation.crop.name,
                    from: formatRotationDate(lastRotation.fromDate),
                    to: formatRotationDate(lastRotation.toDate),
                  })}
            </Text>
            {lastIsPermanent && (
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.blue,
                  marginTop: theme.spacing.xs,
                }}
              >
                {t("crop_rotations.permanent_end_date_info")}
              </Text>
            )}
          </View>
        )}

        {/* Rotation entries */}
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.s }}>
          {entries.map((entry, index) => {
            const errorMessage = entryErrors.get(entry.entryId);
            return (
              <Card
                key={entry.entryId}
                style={
                  errorMessage
                    ? { borderColor: theme.colors.error, borderWidth: 1 }
                    : undefined
                }
              >
                {/* Remove button — only shown when more than 1 entry */}
                {entries.length > 1 && (
                  <View
                    style={{
                      alignItems: "flex-end",
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    <IonIconButton
                      icon="close"
                      iconSize={18}
                      color="black"
                      type="accent"
                      onPress={() => removeEntry(entry.entryId)}
                    />
                  </View>
                )}

                <Select
                  label={t("forms.labels.crop")}
                  value={entry.cropId}
                  enableSearch
                  data={cropSelectData}
                  onChange={(value) =>
                    updateEntry(entry.entryId, { cropId: value })
                  }
                />

                <View
                  style={{
                    flexDirection: "row",
                    gap: theme.spacing.m,
                    flexWrap: "wrap",
                    marginTop: theme.spacing.s,
                  }}
                >
                  <CompactDatePicker
                    label={t("forms.labels.from")}
                    date={entry.fromDate}
                    onDateChange={(date) => {
                      // If fromDate moves past toDate, also push toDate forward
                      const newTo =
                        date.getTime() > entry.toDate.getTime()
                          ? date
                          : entry.toDate;
                      updateEntry(entry.entryId, {
                        fromDate: date,
                        toDate: newTo,
                      });
                    }}
                  />
                  <CompactDatePicker
                    label={t("forms.labels.to")}
                    date={entry.toDate}
                    minimumDate={entry.fromDate}
                    onDateChange={(date) =>
                      updateEntry(entry.entryId, { toDate: date })
                    }
                  />
                </View>

                {errorMessage && (
                  <Text
                    style={{
                      color: theme.colors.error,
                      fontSize: 13,
                      marginTop: theme.spacing.xs,
                    }}
                  >
                    {errorMessage}
                  </Text>
                )}
              </Card>
            );
          })}
        </View>

        {/* Add rotation button */}
        <Button
          type="accent"
          title={t("crop_rotations.add_rotation")}
          onPress={addEntry}
          style={{ marginTop: theme.spacing.s }}
        />
      </ScrollView>
    </ContentView>
  );
}
