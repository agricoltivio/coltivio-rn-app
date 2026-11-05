import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { H3 } from "@/theme/Typography";
import { toLocalDateString } from "@/utils/date";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { SowingSummaryScreenProps } from "../navigation/sowing-routes";
import { useCreateSowingsMutation } from "../sowings.hooks";
import { SowingSummary } from "../SowingSummary";
import { useCreateSowingStore } from "./sowing.store";

export function SowingSummaryScreen({ navigation }: SowingSummaryScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const {
    selectedPlotsById,
    selectedCrop,
    selectedSeed,
    sowing,
    preselectedPlotId,
    returnTo,
  } = useCreateSowingStore();
  const sowingAreas = Object.values(selectedPlotsById);

  const createSowingsMutation = useCreateSowingsMutation(
    () => {
      if (preselectedPlotId && returnTo === "PlotSowings") {
        navigation.popTo("PlotSowings", {
          plotId: preselectedPlotId,
          name: selectedPlotsById[preselectedPlotId].name,
        });
      } else if (preselectedPlotId && returnTo === "PlotDetails") {
        navigation.popTo("PlotDetails", { plotId: preselectedPlotId });
      } else if (preselectedPlotId) {
        navigation.popTo("PlotsMap", { selectedPlotId: preselectedPlotId });
      } else {
        navigation.reset({
          index: 2,
          routes: [
            { name: "Home" },
            { name: "FieldCalendar" },
            { name: "Sowings" },
          ],
        });
      }
    },
    () => setError(t("errors.unexpected_retry")),
  );

  if (!sowing?.date || !sowing.unit || !selectedCrop || !sowingAreas.length) {
    return null;
  }
  const { date, unit, additionalNotes } = sowing;

  function onSave() {
    setError(null);
    createSowingsMutation.mutate({
      date: toLocalDateString(date),
      // with a seed the API takes the crop from the seed
      cropId: selectedSeed ? undefined : selectedCrop?.id,
      seedId: selectedSeed?.id,
      unit,
      additionalNotes,
      plots: sowingAreas.map((area) => ({
        plotId: area.plotId,
        geometry: area.geometry,
        size: area.size,
        amount: area.amount,
      })),
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          {error && (
            <Card
              style={{
                backgroundColor: theme.colors.danger,
                marginBottom: theme.spacing.s,
              }}
            >
              <H3 style={{ color: theme.colors.white }}>{error}</H3>
            </Card>
          )}
          <Button
            title={t("buttons.save")}
            onPress={onSave}
            disabled={createSowingsMutation.isPending}
            loading={createSowingsMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <SowingSummary
        sowingAreas={sowingAreas}
        unit={unit}
        date={date}
        cropName={selectedCrop.name}
        seedName={selectedSeed?.name}
        additionalNotes={additionalNotes}
      />
    </ContentView>
  );
}
