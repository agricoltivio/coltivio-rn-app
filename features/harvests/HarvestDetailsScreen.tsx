import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { HarvestDetailsScreenProps } from "./navigation/harvest-routes";
import { useDeleteHarvestMutation, useHarvestQuery } from "./harvests.hooks";
import { HarvestSummary } from "./HarvestSummary";
import { useTranslation } from "react-i18next";
import { round } from "@/utils/math";
import { usePermissions } from "@/features/user/users.hooks";

export function HarvestDetailsScreen({
  route,
  navigation,
}: HarvestDetailsScreenProps) {
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
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
    unit,
    numberOfUnits,
    kilosPerUnit,
    additionalNotes,
  } = harvest;

  function onDelete() {
    deleteHarvestMutation.mutate(harvestId);
  }
  return (
    <ContentView
      footerComponent={
        canWrite("field_calendar") ? (
          <BottomActionContainer>
            <Button
              type="secondary"
              title={t("buttons.delete")}
              onPress={onDelete}
            />
          </BottomActionContainer>
        ) : undefined
      }
    >
      <HarvestSummary
        harvestAreas={[
          {
            amountInKilos: numberOfUnits * kilosPerUnit,
            geometry: geometry,
            harvestSize: size,
            name: plot.name,
            plotId: plot.id,
            numberOfUnits,
          },
        ]}
        date={new Date(date)}
        cropName={crop.name}
        kilosPerUnit={kilosPerUnit}
        conservationMethod={conservationMethod}
        unit={unit}
        producedKilos={round(numberOfUnits * kilosPerUnit, 2)}
        numberOfUnits={numberOfUnits}
        hidePlotList
        additionalNotes={additionalNotes}
      />
    </ContentView>
  );
}
