import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { DeletePlotScreenProps } from "./navigation/plots-routes";
import { H2, Subtitle } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useDeletePlotMutation } from "./plots.hooks";
import { useTranslation } from "react-i18next";

export function DeletePlotScreen({ navigation, route }: DeletePlotScreenProps) {
  const { t } = useTranslation();
  const { plotId, name } = route.params;
  const theme = useTheme();

  navigation.getState().routes;
  const deletePlotMutation = useDeletePlotMutation(
    () => navigation.pop(3),
    (error) => console.error(error),
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
          <Button
            type="danger"
            title={t("buttons.delete")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || deletePlotMutation.isPending}
            loading={deletePlotMutation.isPending}
          />
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
