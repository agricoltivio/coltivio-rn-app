import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { H3, Label } from "@/theme/Typography";
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
import { PlotDetailsContent } from "../PlotDetailsContent";
import { usePlotsMapContext } from "./plots-map-mode";

export function PlotDetailsDrawer() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { mode, dispatch, navigation } = usePlotsMapContext();
  // Use all plots (including size-0) so selecting a plot with no geometry still opens the drawer
  const { plots: allPlots } = useFarmPlotsQuery();

  const [sheetIndex, setSheetIndex] = useState(0);
  const snapPoints = useMemo(() => [260, "85%"], []);
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
          {/* Labelled so it's clear the drawer can be expanded */}
          <Pressable
            onPress={() => {
              bottomSheetModalRef.current?.snapToIndex(
                sheetIndex === 1 ? 0 : 1,
              );
            }}
            style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
          >
            <Label style={{ color: theme.colors.gray2 }}>
              {sheetIndex === 1
                ? t("buttons.show_less")
                : t("buttons.show_more")}
            </Label>
            <Ionicons
              name={sheetIndex === 1 ? "chevron-down" : "chevron-up"}
              size={24}
              color={theme.colors.gray2}
            />
          </Pressable>
        </View>

        {selectedPlot && (
          <PlotDetailsContent
            plot={selectedPlot}
            navigation={navigation}
            returnTo="PlotsMap"
          />
        )}
      </BottomDrawerModal>
    </BottomSheetModalProvider>
  );
}
