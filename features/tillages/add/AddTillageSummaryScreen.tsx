import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { AddTillageSummaryScreenProps } from "@/navigation/rootStackTypes";
import { useCreateTillagesMutation } from "../tillages.hooks";
import { TillageSummary } from "../TillageSummary";
import { TillageBase, useAddTillageStore } from "./add-tillage.store";
import { useTranslation } from "react-i18next";

export function AddTillageSummaryScreen({
  navigation,
}: AddTillageSummaryScreenProps) {
  const { t } = useTranslation();
  const { selectedPlotsById, selectedEquipment, data } = useAddTillageStore();
  const { date, action, reason } = data as TillageBase;

  const selectedPlots = Object.values(selectedPlotsById);

  const createTillagesMutation = useCreateTillagesMutation(() =>
    navigation.reset({
      index: 2,
      routes: [
        { name: "Home" },
        { name: "FieldCalendar" },
        { name: "Tillages" },
      ],
    })
  );

  function onSave() {
    createTillagesMutation.mutate({
      action,
      reason,
      date,
      equipmentId: selectedEquipment?.id,
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
          <Button title={t("buttons.save")} onPress={onSave} />
        </BottomActionContainer>
      }
    >
      <TillageSummary
        date={date}
        equipmentName={selectedEquipment?.name}
        action={action}
        reason={reason}
        plots={selectedPlots}
      />
    </ContentView>
  );
}
