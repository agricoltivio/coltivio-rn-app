import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { usePermissions } from "@/features/user/users.hooks";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { SowingDetailsScreenProps } from "./navigation/sowing-routes";
import { useDeleteSowingMutation, useSowingQuery } from "./sowings.hooks";
import { SowingSummary } from "./SowingSummary";

export function SowingDetailsScreen({
  route,
  navigation,
}: SowingDetailsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { canWrite } = usePermissions();
  const sowingId = route.params.sowingId;
  const { sowing } = useSowingQuery(sowingId);
  const deleteSowingMutation = useDeleteSowingMutation(() =>
    navigation.goBack(),
  );

  if (!sowing) {
    return null;
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
                onPress={() =>
                  Alert.alert(t("sowings.delete_confirm_title"), undefined, [
                    { text: t("buttons.cancel"), style: "cancel" },
                    {
                      text: t("buttons.delete"),
                      style: "destructive",
                      onPress: () => deleteSowingMutation.mutate(sowingId),
                    },
                  ])
                }
                disabled={deleteSowingMutation.isPending}
                loading={deleteSowingMutation.isPending}
              />
              <Button
                style={{ flexGrow: 1 }}
                title={t("buttons.edit")}
                onPress={() => navigation.navigate("EditSowing", { sowingId })}
              />
            </View>
          </BottomActionContainer>
        ) : undefined
      }
    >
      <SowingSummary
        sowingAreas={[
          {
            plotId: sowing.plot.id,
            name: sowing.plot.name,
            geometry: sowing.geometry,
            size: sowing.size,
            amount: sowing.amount,
          },
        ]}
        unit={sowing.unit}
        date={new Date(sowing.date)}
        cropName={sowing.crop.name}
        seedName={sowing.seed?.name}
        additionalNotes={sowing.additionalNotes}
        hidePlotList
      />
    </ContentView>
  );
}
