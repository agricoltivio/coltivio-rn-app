import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { HarvestSummaryScreenProps } from "../navigation/harvest-routes";
import { useCreateHarvestMutation } from "../harvests.hooks";
import { HarvestSummary } from "../HarvestSummary";
import { Harvest, useCreateHarvestStore } from "./harvest.store";
import { useTranslation } from "react-i18next";

export function HarvestSummaryScreen({
  navigation,
}: HarvestSummaryScreenProps) {
  const { t } = useTranslation();
  const {
    selectedPlotsById,
    selectedCrop,
    totalProducedUnits = 0,
    harvest,
  } = useCreateHarvestStore();

  const {
    date,
    kilosPerUnit,
    unit,
    additionalNotes,
    cropId,
    conservationMethod,
  } = harvest as Harvest;

  const totalProducedKilos = totalProducedUnits * kilosPerUnit;
  const plotHarvests = Object.values(selectedPlotsById);

  const createHarvestMutation = useCreateHarvestMutation(() =>
    navigation.reset({
      index: 2,
      routes: [
        { name: "Home" },
        { name: "FieldCalendar" },
        { name: "Harvests" },
      ],
    }),
  );

  function onSave() {
    createHarvestMutation.mutate({
      unit,
      additionalNotes,
      cropId,
      date: date.toISOString(),
      harvestCount: harvest?.harvestCount,
      kilosPerUnit,
      conservationMethod,
      plots: plotHarvests.map((plot) => ({
        geometry: plot.geometry,
        plotId: plot.plotId,
        size: plot.harvestSize,
        numberOfUnits: plot.numberOfUnits!,
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
            disabled={createHarvestMutation.isPending}
            loading={createHarvestMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <HarvestSummary
        date={date}
        cropName={selectedCrop!.name}
        kilosPerUnit={kilosPerUnit}
        unit={unit}
        conservationMethod={conservationMethod}
        producedKilos={totalProducedKilos}
        numberOfUnits={totalProducedUnits}
        additionalNotes={additionalNotes}
        harvestAreas={plotHarvests}
      />
    </ContentView>
  );
}
