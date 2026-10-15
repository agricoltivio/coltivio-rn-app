import { Tillage, TillageAction } from "@/api/tillages.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { EditTillageScreenProps } from "./navigation/tillages-routes";
import { useTillageQuery, useUpdateTillageMutation } from "./tillages.hooks";
import { tillageActions } from "./tillageUtils";

type FormValues = {
  date: Date;
  action: TillageAction;
  customAction?: string;
  additionalNotes?: string;
};

export function EditTillageScreen({
  route,
  navigation,
}: EditTillageScreenProps) {
  const { tillage } = useTillageQuery(route.params.tillageId);

  if (!tillage) {
    return null;
  }

  return (
    <EditTillageForm tillage={tillage} onSaved={() => navigation.goBack()} />
  );
}

// Separate component so the form is initialized with loaded tillage values
function EditTillageForm({
  tillage,
  onSaved,
}: {
  tillage: Tillage;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const updateTillageMutation = useUpdateTillageMutation(onSaved);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date(tillage.date),
      action: tillage.action,
      customAction: tillage.customAction ?? undefined,
      additionalNotes: tillage.additionalNotes ?? undefined,
    },
  });

  const action = watch("action");

  const actionOptions: { label: string; value: string }[] = tillageActions.map(
    (tillageAction) => ({
      label: t(`tillages.actions.${tillageAction}`) as string,
      value: tillageAction,
    }),
  );

  function onSubmit(values: FormValues) {
    updateTillageMutation.mutate({
      tillageId: tillage.id,
      input: {
        date: values.date.toISOString(),
        action: values.action,
        customAction: values.action === "custom" ? values.customAction : null,
        additionalNotes: values.additionalNotes,
      },
    });
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={updateTillageMutation.isPending}
            loading={updateTillageMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("tillages.edit_tillage")}
        keyboardAware
      >
        <H2>{t("tillages.edit_tillage")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <RHDatePicker
            name="date"
            control={control}
            label={t("forms.labels.date")}
            mode="date"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.date?.message}
          />

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
