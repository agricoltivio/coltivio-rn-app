import { Plot } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { SelectPlotsMap } from "@/components/map/SelectPlotsMap";
import { round } from "@/utils/math";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SelectTillagePlotsScreenProps } from "../navigation/tillages-routes";
import { useAddTillageStore } from "./add-tillage.store";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";

export function SelectTillagePlotsScreen({
  navigation,
}: SelectTillagePlotsScreenProps) {
  const { t } = useTranslation();
  const { localSettings } = useLocalSettings();

  const { putPlot, removePlot, selectedPlotsById, resetSelectedPlots } =
    useAddTillageStore();

  useEffect(() => {
    if (!localSettings.mapDrawOnboardingCompleted) {
      navigation.navigate("MapDrawOnboarding");
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
            onPress={() => navigation.navigate("TillageSummary")}
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
        portalName="AddTillageMap"
        onNavigateToOnboarding={() => navigation.navigate("MapDrawOnboarding")}
      />
    </ContentView>
  );
}
