import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { View } from "react-native";
import { TillageDetailsScreenProps } from "./navigation/tillages-routes";
import { useTheme } from "styled-components/native";
import { useDeleteTillageMutation, useTillageQuery } from "./tillages.hooks";
import { TillageSummary } from "./TillageSummary";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/features/user/users.hooks";

export function TillageDetailsScreen({
  route,
  navigation,
}: TillageDetailsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const tillageId = route.params.tillageId;
  const { tillage } = useTillageQuery(tillageId);

  const deleteMutation = useDeleteTillageMutation(() => {
    navigation.goBack();
  });
  if (!tillage) {
    return null;
  }

  const { date, additionalNotes } = tillage;

  function onDelete() {
    deleteMutation.mutate(tillageId);
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
                  navigation.navigate("EditTillage", { tillageId })
                }
              />
            </View>
          </BottomActionContainer>
        ) : undefined
      }
    >
      <TillageSummary
        date={new Date(date)}
        plots={[
          {
            plotId: tillage.plotId,
            name: tillage.plot.name,
            geometry: tillage.geometry,
            size: tillage.size,
          },
        ]}
        action={tillage.action}
        customAction={tillage.customAction}
        hidePlotList
        additionalNotes={additionalNotes}
      />
    </ContentView>
  );
}
