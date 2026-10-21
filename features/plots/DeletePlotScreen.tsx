import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { DeletePlotScreenProps } from "./navigation/plots-routes";
import { H2, Subtitle } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useDeletePlotMutation, useUpdatePlotMutation } from "./plots.hooks";
import { useTranslation } from "react-i18next";

export function DeletePlotScreen({ navigation, route }: DeletePlotScreenProps) {
  const { t } = useTranslation();
  const { plotId, name } = route.params;
  const theme = useTheme();

  // Reached via the edit modal. Opened from the plot's details screen, that screen
  // is closed too after deleting; from the map, only this screen and the edit modal.
  function popAfterDelete() {
    const navigationState = navigation.getState();
    const routeBeforeEdit = navigationState.routes[navigationState.index - 2];
    navigation.pop(routeBeforeEdit?.name === "PlotDetails" ? 3 : 2);
  }
  const showError = () =>
    Alert.alert(t("common.error"), t("common.unknown_error"));
  const deletePlotMutation = useDeletePlotMutation(popAfterDelete, showError);
  // Archiving instead keeps all entries; back to where editing started
  const archivePlotMutation = useUpdatePlotMutation(
    () => navigation.pop(2),
    showError,
  );

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<{ name: string }>();

  function onSubmit() {
    deletePlotMutation.mutate(plotId);
  }
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <View style={{ gap: theme.spacing.xs }}>
            <Button
              type="accent"
              title={t("archive.archive")}
              onPress={() =>
                // Same confirmation as archiving from the edit screen
                Alert.alert(
                  t("archive.plot_confirm_title", { name: name }),
                  t("archive.plot_info"),
                  [
                    { text: t("buttons.cancel"), style: "cancel" },
                    {
                      text: t("archive.archive"),
                      onPress: () =>
                        archivePlotMutation.mutate({
                          plotId,
                          data: { archived: true },
                        }),
                    },
                  ],
                )
              }
              disabled={
                deletePlotMutation.isPending || archivePlotMutation.isPending
              }
              loading={archivePlotMutation.isPending}
            />
            <Button
              type="danger"
              title={t("buttons.delete")}
              onPress={handleSubmit(onSubmit)}
              disabled={
                !isDirty ||
                deletePlotMutation.isPending ||
                archivePlotMutation.isPending
              }
              loading={deletePlotMutation.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={t("plots.delete.heading", { name })}
      >
        <H2>{t("plots.delete.heading", { name })}</H2>
        <Card
          style={{
            backgroundColor: theme.colors.danger,
            marginTop: theme.spacing.m,
          }}
        >
          <H2 style={{ color: theme.colors.white }}>Danger Zone!</H2>
          <Subtitle
            style={{ color: theme.colors.white, marginTop: theme.spacing.m }}
          >
            {t("plots.delete.entries_warning")}
          </Subtitle>
          <Subtitle
            style={{ color: theme.colors.white, marginTop: theme.spacing.s }}
          >
            {t("archive.plot_delete_hint")}
          </Subtitle>
          <Subtitle
            style={{ color: theme.colors.white, marginTop: theme.spacing.s }}
          >
            {t("plots.delete.confirm_by_typing_name")}
          </Subtitle>
        </Card>
        <View style={{ marginTop: theme.spacing.l }}>
          <RHTextInput
            name="name"
            placeholder={name}
            control={control}
            label={t("forms.labels.name")}
            rules={{
              validate: (value) => {
                if (value !== name) {
                  return t("forms.validation.name_mismatch");
                }
              },
            }}
            error={errors.name?.message}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
