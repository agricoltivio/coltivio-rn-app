import { Plot } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { SelectPlotsMap } from "@/components/map/SelectPlotsMap";
import { round } from "@/utils/math";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SelectFertilizerApplicationPlotsScreenProps } from "../navigation/fertilizer-application-routes";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";

export type SelectedFertilizerApplicationArea = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  size: number;
};

export function SelectFertilizerApplicationPlotsScreen({
  navigation,
}: SelectFertilizerApplicationPlotsScreenProps) {
  const { t } = useTranslation();
  const { localSettings } = useLocalSettings();

  const {
    putPlot,
    removePlot,
    selectedPlotsById,
    resetSelectedPlots,
    totalNumberOfApplications,
    setTotalNumberOfApplications,
    fertilizerApplication,
  } = useCreateFertilizerApplicationStore();

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
        removePlot(plot.id);
      } else {
        putPlot({
          plotId: plot.id,
          name: plot.name,
          geometry: plot.geometry,
          size: round(plot.size, 0),
          numberOfUnits: 0,
        });
      }
    },
    [selectedPlotsById, removePlot, putPlot],
  );

  const handleDrawComplete = useCallback(
    (intersections: Array<{ plot: Plot; geometry: GeoJSON.MultiPolygon; size: number }>) => {
      for (const { plot, geometry, size } of intersections) {
        putPlot({
          name: plot.name,
          plotId: plot.id,
          geometry,
          size: round(size, 0),
          numberOfUnits: 0,
        });
      }
    },
    [putPlot],
  );

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={() => {
              const selectedPlots = Object.values(selectedPlotsById);
              const unit = fertilizerApplication?.unit;

              // For amount_per_hectare: auto-calculate hectares from plot sizes
              if (unit === "amount_per_hectare") {
                const totalHectares = selectedPlots.reduce((acc, p) => acc + p.size, 0) / 10000;
                setTotalNumberOfApplications(totalHectares);
                for (const plot of selectedPlots) {
                  putPlot({ ...plot, numberOfUnits: plot.size / 10000 });
                }
                navigation.navigate("DivideFertilizerApplicationOnPlots");
                return;
              }

              if (selectedPlots.length === 1) {
                const plot = selectedPlots[0];
                putPlot({
                  ...plot,
                  numberOfUnits: totalNumberOfApplications ?? 0,
                });
                navigation.navigate("FertilizerApplicationSummary");
              } else {
                navigation.navigate("DivideFertilizerApplicationOnPlots");
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
        portalName="FertilizerApplicationMap"
        onNavigateToOnboarding={() => navigation.navigate("SelectPlotsOnboarding")}
      />
    </ContentView>
  );
}
