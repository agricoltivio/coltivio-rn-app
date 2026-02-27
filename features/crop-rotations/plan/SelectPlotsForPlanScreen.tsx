import { Plot } from "@/api/plots.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { SelectPlotsMap } from "@/components/map/SelectPlotsMap";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SelectPlotsForPlanScreenProps } from "../navigation/crop-rotations-routes.d";
import { useSelectPlotsStore } from "./select-plots.store";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";

export function SelectPlotsForPlanScreen({
  navigation,
}: SelectPlotsForPlanScreenProps) {
  const { t } = useTranslation();
  const { localSettings } = useLocalSettings();

  const { selectedPlotsById, putPlot, removePlot, resetSelectedPlots } =
    useSelectPlotsStore();

  useEffect(() => {
    return resetSelectedPlots;
  }, []);

  useEffect(() => {
    if (!localSettings.selectPlotsForPlanOnboardingCompleted) {
      navigation.navigate("MapDrawOnboarding", { variant: "cropRotation" });
    }
  }, []);

  const handleTogglePlot = useCallback(
    (plot: Plot) => {
      if (plot.id in selectedPlotsById) {
        removePlot(plot.id);
      } else {
        putPlot(plot);
      }
    },
    [selectedPlotsById, removePlot, putPlot],
  );

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.next")}
            onPress={() => {
              navigation.navigate("PlanCropRotations", {
                plotIds: Object.keys(selectedPlotsById),
              });
            }}
            disabled={Object.keys(selectedPlotsById).length === 0}
          />
        </BottomActionContainer>
      }
    >
      <SelectPlotsMap
        selectedPlotsById={selectedPlotsById}
        onTogglePlot={handleTogglePlot}
      />
    </ContentView>
  );
}
