import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { TillageSummaryScreenProps } from "../navigation/tillages-routes";
import { useCreateTillagesMutation } from "../tillages.hooks";
import { TillageSummary } from "../TillageSummary";
import { TillageBase, useAddTillageStore } from "./add-tillage.store";
import { useTranslation } from "react-i18next";

export function TillageSummaryScreen({
  navigation,
}: TillageSummaryScreenProps) {
  const { t } = useTranslation();
  const { selectedPlotsById, data } = useAddTillageStore();
  const { date, action, customAction, additionalNotes } = data as TillageBase;

  const selectedPlots = Object.values(selectedPlotsById);

  const createTillagesMutation = useCreateTillagesMutation(() =>
    navigation.reset({
      index: 2,
      routes: [
        { name: "Home" },
        { name: "FieldCalendar" },
        { name: "Tillages" },
      ],
    }),
  );

  function onSave() {
    createTillagesMutation.mutate({
      action,
      date: date.toISOString(),
      additionalNotes,
      plots: selectedPlots.map((plot) => ({
        plotId: plot.plotId,
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
            disabled={createTillagesMutation.isPending}
            loading={createTillagesMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <TillageSummary
        date={date}
        action={action}
        customAction={customAction}
        plots={selectedPlots}
        additionalNotes={additionalNotes}
      />
    </ContentView>
  );
}
