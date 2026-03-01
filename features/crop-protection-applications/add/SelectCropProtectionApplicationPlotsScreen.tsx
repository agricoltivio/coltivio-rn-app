import { Plot } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { SelectPlotsMap } from "@/components/map/SelectPlotsMap";
import { round } from "@/utils/math";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SelectCropProtectionApplicationPlotsScreenProps } from "../navigation/crop-protection-application-routes";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";

export type SelectedCropProtectionApplicationArea = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  size: number;
};

export function SelectCropProtectionApplicationPlotsScreen({
  navigation,
}: SelectCropProtectionApplicationPlotsScreenProps) {
  const { t } = useTranslation();
  const { localSettings } = useLocalSettings();

  const {
    putPlot,
    removePlot,
    selectedPlotsById,
    resetSelectedPlots,
    totalNumberOfUnits: totalNumberOfApplications,
    setTotalNumberOfUnits,
    data,
  } = useAddCropProtectionApplicationStore();

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
              const unit = data?.unit;

              if (unit === "amount_per_hectare") {
                const totalHectares = selectedPlots.reduce((acc, p) => acc + p.size, 0) / 10000;
                setTotalNumberOfUnits(totalHectares);
                for (const plot of selectedPlots) {
                  putPlot({ ...plot, numberOfUnits: plot.size / 10000 });
                }
                navigation.navigate("DivideCropProtectionApplicationOnPlots");
                return;
              }

              if (selectedPlots.length === 1) {
                const plot = selectedPlots[0];
                putPlot({
                  ...plot,
                  numberOfUnits: totalNumberOfApplications ?? 0,
                });
                navigation.navigate("CropProtectionApplicationSummary");
              } else {
                navigation.navigate("DivideCropProtectionApplicationOnPlots");
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
        portalName="CropProtectionApplicationMap"
        onNavigateToOnboarding={() => navigation.navigate("SelectPlotsOnboarding")}
      />
    </ContentView>
  );
}
