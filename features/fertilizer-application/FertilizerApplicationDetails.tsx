import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { View } from "react-native";
import { FertilizerApplicationDetailsScreenProps } from "./navigation/fertilizer-application-routes";
import { useTheme } from "styled-components/native";
import {
  useDeleteFertilizerApplicationMutation,
  useFertilizerApplicationQuery,
} from "./fertilizerApplications.hooks";
import { FertilizerApplicationSummary } from "./FertilizerApplicationSummary";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/features/user/users.hooks";

export function FertilizerApplicationDetailsScreen({
  route,
  navigation,
}: FertilizerApplicationDetailsScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { canWrite } = usePermissions();
  const fertilizerApplicationId = route.params.fertilizerApplicationId;
  const { fertilizerApplication } = useFertilizerApplicationQuery(
    fertilizerApplicationId,
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
    <ContentView
      footerComponent={
        canWrite("field_calendar") ? (
          <BottomActionContainer>
            <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
              <Button
                style={{ flexGrow: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={onDelete}
                disabled={deleteMutation.isPending}
                loading={deleteMutation.isPending}
              />
              <Button
                style={{ flexGrow: 1 }}
                title={t("buttons.edit")}
                onPress={() =>
                  navigation.navigate("EditFertilizerApplication", {
                    fertilizerApplicationId,
                  })
                }
              />
            </View>
          </BottomActionContainer>
        ) : undefined
      }
    >
      <FertilizerApplicationSummary
        date={new Date(date)}
        fertilizerName={fertilizerApplication.fertilizer.name!}
        amountPerUnit={fertilizerApplication.amountPerUnit}
        totalNumberOfUnits={fertilizerApplication.numberOfUnits}
        unit={fertilizerApplication.unit}
        plots={[
          {
            plotId: fertilizerApplication.plotId,
            name: fertilizerApplication.plot.name,
            numberOfUnits: fertilizerApplication.numberOfUnits,
            geometry: fertilizerApplication.geometry,
            size: fertilizerApplication.size,
          },
        ]}
        hidePlotList
        additionalNotes={additionalNotes}
        productUnit={fertilizerApplication.fertilizer.unit ?? "kg"}
      />
    </ContentView>
  );
}
