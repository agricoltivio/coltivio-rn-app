import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { HarvestDetailsScreenProps } from "./navigation/harvest-routes";
import { useDeleteHarvestMutation, useHarvestQuery } from "./harvests.hooks";
import { HarvestSummary } from "./HarvestSummary";
import { useTranslation } from "react-i18next";
import { round } from "@/utils/math";

export function HarvestDetailsScreen({
  route,
  navigation,
}: HarvestDetailsScreenProps) {
  const { t } = useTranslation();
  const harvestId = route.params.harvestId;
  const { harvest } = useHarvestQuery(harvestId);

  const deleteHarvestMutation = useDeleteHarvestMutation(() => {
    navigation.goBack();
  });
  if (!harvest) {
    return null;
  }

  const {
    plot,
    geometry,
    size,
    date,
    crop,
    conservationMethod,
    processingType,
    producedUnits,
    kilosPerUnit,
    additionalNotes,
    machinery,
  } = harvest;

  function onDelete() {
    deleteHarvestMutation.mutate(harvestId);
  }
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="secondary"
            title={t("buttons.delete")}
            onPress={onDelete}
          />
        </BottomActionContainer>
      }
    >
      <HarvestSummary
        harvestAreas={[
          {
            amountInKilos: producedUnits * kilosPerUnit,
            geometry: geometry,
            harvestSize: size,
            name: plot.name,
            plotId: plot.id,
            producedUnits,
          },
        ]}
        date={new Date(date)}
        cropName={crop.name}
        kilosPerUnit={kilosPerUnit}
        conservationMethod={conservationMethod}
        processingType={processingType}
        machineryName={machinery?.name}
        producedKilos={round(producedUnits * kilosPerUnit, 2)}
        producedUnits={producedUnits}
        hidePlotList
        additionalNotes={additionalNotes}
      />
    </ContentView>
  );
}
