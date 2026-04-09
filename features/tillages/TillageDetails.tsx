import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
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
    <ContentView>
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
      {canWrite("field_calendar") && (
        <Button
          style={{ marginBottom: theme.spacing.m }}
          type="secondary"
          title={t("buttons.delete")}
          onPress={onDelete}
        />
      )}
    </ContentView>
  );
}
