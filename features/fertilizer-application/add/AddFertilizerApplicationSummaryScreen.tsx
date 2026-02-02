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
    selectedSpreader,
    selectedFertilizer,
    totalNumberOfApplications = 0,

    fertilizerApplication,
  } = useCreateFertilizerApplicationStore();

  const { date, method, unit, additionalNotes, amountPerApplication } =
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
      })
    );

  function onSave() {
    createFertilizerApplicationMutation.mutate({
      date: date.toISOString(),
      spreaderId: selectedSpreader?.id,
      fertilizerId: selectedFertilizer?.id!,
      method,
      unit,
      amountPerApplication,
      additionalNotes,
      plots: selectedPlots.map((plot) => ({
        plotId: plot.plotId,
        numberOfApplications: plot.numberOfApplications,
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
        spreaderName={selectedSpreader?.name}
        fertilizerName={selectedFertilizer?.name!}
        amountPerApplication={amountPerApplication}
        totalNumberOfApplications={totalNumberOfApplications}
        unit={unit}
        plots={selectedPlots}
        additionalNotes={additionalNotes}
      />
    </ContentView>
  );
}
