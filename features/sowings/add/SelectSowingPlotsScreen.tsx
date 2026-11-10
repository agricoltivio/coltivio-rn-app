import { Plot } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { SelectPlotsMap } from "@/components/map/SelectPlotsMap";
import { round } from "@/utils/math";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocalSettings } from "../../user/LocalSettingsContext";
import { SelectSowingPlotsScreenProps } from "../navigation/sowing-routes";
import { isPerAreaUnit } from "../sowingUnits";
import { useCreateSowingStore } from "./sowing.store";

export function SelectSowingPlotsScreen({
  navigation,
}: SelectSowingPlotsScreenProps) {
  const { t } = useTranslation();
  const { localSettings } = useLocalSettings();
  const { sowing, putSowingPlot, removeSowingPlot, selectedPlotsById } =
    useCreateSowingStore();

  function onNext() {
    const plots = Object.values(selectedPlotsById);
    const amount = sowing?.amount ?? 0;
    const perArea = sowing?.unit !== undefined && isPerAreaUnit(sowing.unit);
    // a total on several plots has to be split, otherwise every plot gets the amount
    if (!perArea && plots.length > 1) {
      navigation.navigate("DivideSowingOnPlots");
      return;
    }
    for (const plot of plots) {
      putSowingPlot({ ...plot, amount });
    }
    navigation.navigate("SowingSummary");
  }

  useEffect(() => {
    if (!localSettings.mapDrawOnboardingCompleted) {
      navigation.navigate("SelectPlotsOnboarding");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTogglePlot = useCallback(
    (plot: Plot) => {
      if (plot.id in selectedPlotsById) {
        removeSowingPlot(plot.id);
      } else {
        putSowingPlot({
          plotId: plot.id,
          name: plot.name,
          geometry: plot.geometry,
          size: round(plot.size, 0),
          amount: 0,
        });
      }
    },
    [selectedPlotsById, removeSowingPlot, putSowingPlot],
  );

  // a drawn area only covers part of a plot, so it brings its own geometry and size
  const handleDrawComplete = useCallback(
    (
      intersections: {
        plot: Plot;
        geometry: GeoJSON.MultiPolygon;
        size: number;
      }[],
    ) => {
      for (const { plot, geometry, size } of intersections) {
        // a sliver rounds to 0 m², the API refuses a sowing without area
        if (round(size, 0) < 1) continue;
        putSowingPlot({
          plotId: plot.id,
          name: plot.name,
          geometry,
          size: round(size, 0),
          amount: 0,
        });
      }
    },
    [putSowingPlot],
  );

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={onNext}
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
        portalName="SowingMap"
        onNavigateToOnboarding={() =>
          navigation.navigate("SelectPlotsOnboarding")
        }
      />
    </ContentView>
  );
}
