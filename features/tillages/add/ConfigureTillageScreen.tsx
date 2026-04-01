import { TillagePresetCreateInput } from "@/api/tillagePresets.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAddTillageStore } from "./add-tillage.store";
import { ConfigureTillageScreenProps } from "../navigation/tillages-routes";
import { tillageActions } from "../tillageUtils";

type FormValues = {
  action: TillagePresetCreateInput["action"];
  customAction?: string;
  additionalNotes?: string;
};

export function ConfigureTillageScreen({
  navigation,
}: ConfigureTillageScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setData, data } = useAddTillageStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      action: data?.action,
      customAction: data?.customAction ?? undefined,
      additionalNotes: data?.additionalNotes ?? undefined,
    },
  });

  const action = watch("action");

  const actionOptions: { label: string; value: string }[] = tillageActions.map(
    (action) => ({
      label: t(`tillages.actions.${action}`) as string,
      value: action,
    }),
  );

  function onSubmit(values: FormValues) {
    setData({
      action: values.action,
      customAction:
        values.action === "custom" ? values.customAction : undefined,
      additionalNotes: values.additionalNotes,
    });

    navigation.navigate("SelectTillagePlots");
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button title={t("buttons.next")} onPress={handleSubmit(onSubmit)} />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("tillages.tillage_configuration")}
        keyboardAware
      >
        <H2>{t("tillages.tillage_configuration")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <RHSelect
            name="action"
            control={control}
            label={t("forms.labels.action")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.action?.message}
            data={actionOptions}
          />

          {action === "custom" && (
            <RHTextInput
              name="customAction"
              control={control}
              label={t("tillages.custom_action")}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.customAction?.message}
            />
          )}

          <RHTextAreaInput
            name="additionalNotes"
            control={control}
            label={t("forms.labels.additional_notes_optional")}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
