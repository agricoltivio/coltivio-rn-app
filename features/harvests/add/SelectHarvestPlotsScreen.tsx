import { Plot } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { SelectPlotsMap } from "@/components/map/SelectPlotsMap";
import { round } from "@/utils/math";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { useFarmPlotsQuery } from "../../plots/plots.hooks";
import { useLocalSettings } from "../../user/LocalSettingsContext";
import { SelectHarvestPlotsScreenProps } from "../navigation/harvest-routes";
import { useCreateHarvestStore } from "./harvest.store";

export type SelectedHarvestArea = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  size: number;
};

export function SelectHarvestPlotsScreen({
  navigation,
}: SelectHarvestPlotsScreenProps) {
  const { t } = useTranslation();
  const { plots } = useFarmPlotsQuery();
  const { localSettings } = useLocalSettings();

  const {
    harvest,
    putHarvestPlot,
    removeHarvestPlot,
    selectedPlotsById,
    resetSelectedPlots,
    totalProducedUnits,
  } = useCreateHarvestStore();

  useEffect(() => {
    if (!localSettings.mapDrawOnboardingCompleted) {
      navigation.navigate("SelectPlotsOnboarding");
    }
  }, []);

  useEffect(() => {
    return resetSelectedPlots;
  }, []);

  const handleTogglePlot = useCallback(
    (plot: Plot) => {
      if (plot.id in selectedPlotsById) {
        removeHarvestPlot(plot.id);
      } else {
        putHarvestPlot({
          plotId: plot.id,
          name: plot.name,
          geometry: plot.geometry,
          harvestSize: round(plot.size, 0),
          amountInKilos: 0,
          numberOfUnits: 0,
        });
      }
    },
    [selectedPlotsById, removeHarvestPlot, putHarvestPlot],
  );

  const handleDrawComplete = useCallback(
    (intersections: Array<{ plot: Plot; geometry: GeoJSON.MultiPolygon; size: number }>) => {
      for (const { plot, geometry, size } of intersections) {
        putHarvestPlot({
          name: plot.name,
          plotId: plot.id,
          geometry,
          harvestSize: round(size, 0),
          amountInKilos: 0,
          numberOfUnits: 0,
        });
      }
    },
    [putHarvestPlot],
  );

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={() => {
              const selectedPlots = Object.values(selectedPlotsById);
              if (selectedPlots.length === 1) {
                const plot = selectedPlots[0];
                putHarvestPlot({
                  ...plot,
                  numberOfUnits: totalProducedUnits ?? 0,
                });
                navigation.navigate("HarvestSummary");
              } else {
                navigation.navigate("DivideHarvestOnPlots");
              }
            }}
            disabled={!Object.values(selectedPlotsById).length}
          />
        </BottomActionContainer>
      }
    >
      <SelectPlotsMap
        selectedPlotsById={selectedPlotsById}
        onTogglePlot={handleTogglePlot}
        onDrawComplete={handleDrawComplete}
        enableDrawing
        portalName="HarvestMap"
        onNavigateToOnboarding={() => navigation.navigate("SelectPlotsOnboarding")}
      />
    </ContentView>
  );
}
