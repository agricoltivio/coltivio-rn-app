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
    selectedHarvestPlotsById,
    selectedHarvestingMachinery,
    selectedCrop,
    totalProducedUnits = 0,
    harvest,
  } = useCreateHarvestStore();

  const {
    date,
    kilosPerUnit,
    processingType,
    additionalNotes,
    cropId,
    conservationMethod,
  } = harvest as Harvest;

  const totalProducedKilos = totalProducedUnits * kilosPerUnit;
  const plotHarvests = Object.values(selectedHarvestPlotsById);

  const createHarvestMutation = useCreateHarvestMutation(() =>
    navigation.reset({
      index: 2,
      routes: [
        { name: "Home" },
        { name: "FieldCalendar" },
        { name: "Harvests" },
      ],
    })
  );

  function onSave() {
    createHarvestMutation.mutate({
      processingType,
      additionalNotes,
      cropId,
      date: date.toISOString(),
      machineryId: harvest?.machineryId,
      harvestCount: harvest?.harvestCount,
      kilosPerUnit,
      conservationMethod,
      plots: plotHarvests.map((plot) => ({
        geometry: plot.harvestArea,
        plotId: plot.plotId,
        size: plot.harvestSize,
        producedUnits: plot.producedUnits!,
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
        processingType={processingType}
        conservationMethod={conservationMethod}
        machineryName={selectedHarvestingMachinery?.name}
        producedKilos={totalProducedKilos}
        producedUnits={totalProducedUnits}
        additionalNotes={additionalNotes}
        harvestAreas={plotHarvests}
      />
    </ContentView>
  );
}
