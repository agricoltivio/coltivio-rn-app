import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { FertilizerApplicationDetailsScreenProps } from "./navigation/fertilizer-application-routes";
import { useTheme } from "styled-components/native";
import {
  useDeleteFertilizerApplicationMutation,
  useFertilizerApplicationQuery,
} from "./fertilizerApplications.hooks";
import { FertilizerApplicationSummary } from "./FertilizerApplicationSummary";
import { useTranslation } from "react-i18next";

export function FertilizerApplicationDetailsScreen({
  route,
  navigation,
}: FertilizerApplicationDetailsScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const fertilizerApplicationId = route.params.fertilizerApplicationId;
  const { fertilizerApplication } = useFertilizerApplicationQuery(
    fertilizerApplicationId
  );

  const deleteMutation = useDeleteFertilizerApplicationMutation(() => {
    navigation.goBack();
  });
  if (!fertilizerApplication) {
    return null;
  }

  const { date, additionalNotes } = fertilizerApplication;

  function onDelete() {
    deleteMutation.mutate(fertilizerApplicationId);
  }
  return (
    <ContentView>
      <FertilizerApplicationSummary
        date={date}
        spreaderName={fertilizerApplication.spreader?.name}
        fertilizerName={fertilizerApplication.fertilizer.name!}
        amountPerApplication={fertilizerApplication.amountPerApplication}
        totalNumberOfApplications={fertilizerApplication.numberOfApplications}
        unit={fertilizerApplication.unit}
        plots={[
          {
            plotId: fertilizerApplication.plotId,
            name: fertilizerApplication.plot.name,
            numberOfApplications: fertilizerApplication.numberOfApplications,
            geometry: fertilizerApplication.geometry,
            size: fertilizerApplication.size,
          },
        ]}
        hidePlotList
        additionalNotes={additionalNotes}
      />
      <Button
        style={{ marginBottom: theme.spacing.m }}
        type="secondary"
        title={t("buttons.delete")}
        onPress={onDelete}
      />
    </ContentView>
  );
}
