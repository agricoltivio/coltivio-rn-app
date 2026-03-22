import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { ListItem } from "@/components/list/ListItem";
import { locale } from "@/locales/i18n";
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
import { Pressable, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useFarmPlotsQuery } from "@/features/plots/plots.hooks";
import { usePlotsMapContext } from "./plots-map-mode";

export function PlotDetailsDrawer() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode, dispatch, navigation } = usePlotsMapContext();
  // Use all plots (including size-0) so selecting a plot with no geometry still opens the drawer
  const { plots: allPlots } = useFarmPlotsQuery();

  const [sheetIndex, setSheetIndex] = useState(0);
  const snapPoints = useMemo(() => [200, "85%"], []);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const selectedPlotId = mode.type === "view" ? mode.selectedPlotId : null;
  const selectedPlot = selectedPlotId
    ? allPlots?.find((p) => p.id === selectedPlotId)
    : undefined;

  const handleExpandBottomDrawer = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSheetChange = useCallback((index: number) => {
    if (index >= 0) setSheetIndex(index);
  }, []);

  // Show/hide drawer based on selection.
  // selectedPlot?.id is included as a dependency because after split/merge/create the new
  // plotId is selected before the query has refetched — selectedPlot is briefly undefined,
  // which would dismiss the drawer. Re-running when the plot data arrives ensures present()
  // is called once the plot is actually in the cache.
  // RAF defers present() by one frame so a freshly-remounted BottomSheetModal (was null
  // while in split/merge/adjust/create mode) has time to initialize.
  useEffect(() => {
    if (selectedPlot) {
      const raf = requestAnimationFrame(() => {
        bottomSheetModalRef.current?.present();
        bottomSheetModalRef.current?.snapToIndex(0);
      });
      return () => cancelAnimationFrame(raf);
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [selectedPlot?.id]);

  // Don't render in non-view modes
  if (mode.type !== "view") return null;

  return (
    <BottomSheetModalProvider>
      <BottomDrawerModal
        onClose={() => dispatch({ type: "SELECT_PLOT", plotId: null })}
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

        {selectedPlot && (
          <>
            <Card style={{ marginTop: theme.spacing.m }}>
              {/* Area row (no edit icon) */}
              <SummaryItem
                label={t("forms.labels.area")}
                value={`${(selectedPlot.size ?? 0) / 100}a`}
              />
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
                navigation.navigate("EditPlotModal", {
                  plotId: selectedPlot.id,
                })
              }
            />
          </>
        )}
      </BottomDrawerModal>
    </BottomSheetModalProvider>
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
        alignItems: "flex-start",
      }}
    >
      <Label numberOfLines={1} style={{ flexShrink: 0 }}>
        {label}
      </Label>
      <Label style={{ flex: 1, fontSize: 18, textAlign: "right" }}>
        {value}
      </Label>
    </View>
  );
}
