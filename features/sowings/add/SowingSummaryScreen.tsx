import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { toLocalDateString } from "@/utils/date";
import { useTranslation } from "react-i18next";
import { SowingSummaryScreenProps } from "../navigation/sowing-routes";
import { useCreateSowingsMutation } from "../sowings.hooks";
import { SowingSummary } from "../SowingSummary";
import { useCreateSowingStore } from "./sowing.store";

export function SowingSummaryScreen({ navigation }: SowingSummaryScreenProps) {
  const { t } = useTranslation();
  const {
    selectedPlotsById,
    selectedCrop,
    selectedSeed,
    sowing,
    preselectedPlotId,
    returnTo,
  } = useCreateSowingStore();
  const sowingAreas = Object.values(selectedPlotsById);

  const createSowingsMutation = useCreateSowingsMutation(() => {
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
  });

  if (!sowing?.date || !sowing.unit || !selectedCrop || !sowingAreas.length) {
    return null;
  }
  const { date, unit, additionalNotes } = sowing;

  function onSave() {
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
