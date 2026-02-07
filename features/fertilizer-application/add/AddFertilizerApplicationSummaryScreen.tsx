import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { AddFertilizerApplicationSummaryScreenProps } from "../navigation/fertilizer-application-routes";
import { useCreateFertilizerApplicationsMutation } from "../fertilizerApplications.hooks";
import { FertilizerApplicationSummary } from "../FertilizerApplicationSummary";
import {
  FertilizerApplication,
  useCreateFertilizerApplicationStore,
} from "./fertilizerApplication.store";
import { useTranslation } from "react-i18next";

export function AddFertilizerApplicationSummaryScreen({
  navigation,
}: AddFertilizerApplicationSummaryScreenProps) {
  const { t } = useTranslation();
  const {
    selectedPlotsById,
    selectedFertilizer,
    totalNumberOfApplications = 0,
    fertilizerApplication,
  } = useCreateFertilizerApplicationStore();

  const { date, method, unit, additionalNotes, amountPerUnit } =
    fertilizerApplication as FertilizerApplication;

  const selectedPlots = Object.values(selectedPlotsById);

  const createFertilizerApplicationMutation =
    useCreateFertilizerApplicationsMutation(() =>
      navigation.reset({
        index: 2,
        routes: [
          { name: "Home" },
          { name: "FieldCalendar" },
          { name: "FertilizerApplications" },
        ],
      }),
    );

  function onSave() {
    createFertilizerApplicationMutation.mutate({
      date: date.toISOString(),
      fertilizerId: selectedFertilizer?.id!,
      method,
      unit,
      amountPerUnit,
      additionalNotes,
      plots: selectedPlots.map((plot) => ({
        plotId: plot.plotId,
        numberOfUnits: plot.numberOfUnits,
        geometry: plot.geometry,
        size: plot.size,
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
            disabled={createFertilizerApplicationMutation.isPending}
            loading={createFertilizerApplicationMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <FertilizerApplicationSummary
        date={date}
        fertilizerName={selectedFertilizer?.name!}
        amountPerUnit={amountPerUnit}
        totalNumberOfUnits={totalNumberOfApplications}
        unit={unit}
        plots={selectedPlots}
        additionalNotes={additionalNotes}
      />
    </ContentView>
  );
}
