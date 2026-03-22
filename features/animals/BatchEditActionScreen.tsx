import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHSwitch } from "@/components/inputs/RHSwitch";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useBatchUpdateAnimalsMutation,
  useDeleteAnimalsMutation,
} from "./animals.hooks";
import { BatchEditActionScreenProps } from "./navigation/animals-routes";

type ActionType = "type" | "death" | "registered" | "usage" | "delete";

type FormValues = {
  action: ActionType;
  type: string;
  dateOfDeath: Date;
  deathReason: string;
  registered: boolean;
  usage: string;
};

export function BatchEditActionScreen({
  route,
  navigation,
}: BatchEditActionScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { animalIds } = route.params;
  const count = animalIds.length;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      registered: true,
      dateOfDeath: new Date(),
    },
  });

  const selectedAction = useWatch({ control, name: "action" });

  const batchUpdate = useBatchUpdateAnimalsMutation(
    () => navigation.popTo("Animals"),
    (error) => Alert.alert("Error", error.message),
  );

  const deleteAnimals = useDeleteAnimalsMutation(
    () => navigation.popTo("Animals"),
    (error) => Alert.alert("Error", error.message),
  );

  const isLoading = batchUpdate.isPending || deleteAnimals.isPending;

  function onSubmit(values: FormValues) {
    if (values.action === "delete") {
      deleteAnimals.mutate(animalIds);
      return;
    }

    // Build the batch update payload based on the selected action
    if (values.action === "type") {
      batchUpdate.mutate({
        animalIds,
        data: {
          type: values.type as
            | "goat"
            | "sheep"
            | "cow"
            | "horse"
            | "donkey"
            | "pig"
            | "deer",
        },
      });
    } else if (values.action === "death") {
      batchUpdate.mutate({
        animalIds,
        data: {
          dateOfDeath: values.dateOfDeath.toISOString(),
          deathReason: values.deathReason as "died" | "slaughtered",
        },
      });
    } else if (values.action === "registered") {
      batchUpdate.mutate({
        animalIds,
        data: { registered: values.registered },
      });
    } else if (values.action === "usage") {
      batchUpdate.mutate({
        animalIds,
        data: { usage: values.usage as "milk" | "other" },
      });
    }
  }

  const actionData = [
    { label: t("animals.batch_edit.action_set_type"), value: "type" },
    { label: t("animals.batch_edit.action_set_death"), value: "death" },
    {
      label: t("animals.batch_edit.action_set_registered"),
      value: "registered",
    },
    { label: t("animals.batch_edit.action_set_usage"), value: "usage" },
    { label: t("animals.batch_edit.action_delete"), value: "delete" },
  ];

  const animalTypeData = [
    { label: t("animals.animal_types.goat"), value: "goat" },
    { label: t("animals.animal_types.sheep"), value: "sheep" },
    { label: t("animals.animal_types.cow"), value: "cow" },
    { label: t("animals.animal_types.horse"), value: "horse" },
    { label: t("animals.animal_types.donkey"), value: "donkey" },
    { label: t("animals.animal_types.pig"), value: "pig" },
    { label: t("animals.animal_types.deer"), value: "deer" },
  ];

  const deathReasonData = [
    { label: t("animals.death_reasons.died"), value: "died" },
    { label: t("animals.death_reasons.slaughtered"), value: "slaughtered" },
  ];

  const usageData = [
    { label: t("animals.usage_types.milk"), value: "milk" },
    { label: t("animals.usage_types.other"), value: "other" },
  ];

  const isDelete = selectedAction === "delete";

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            type={isDelete ? "danger" : "primary"}
            title={
              isDelete
                ? t("animals.batch_edit.delete_n_animals", { count })
                : t("animals.batch_edit.update_n_animals", { count })
            }
            onPress={handleSubmit(onSubmit)}
            disabled={!selectedAction}
            loading={isLoading}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("animals.batch_edit.select_action_title")}
        keyboardAware
      >
        <H2>{t("animals.batch_edit.select_action_title")}</H2>

        <View style={{ gap: theme.spacing.m, marginTop: theme.spacing.l }}>
          <RHSelect
            name="action"
            control={control}
            label={t("animals.batch_edit.select_action")}
            data={actionData}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.action?.message}
          />

          {/* Action-specific fields */}
          {selectedAction === "type" && (
            <RHSelect
              name="type"
              control={control}
              label={t("animals.batch_edit.action_set_type")}
              data={animalTypeData}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.type?.message}
            />
          )}

          {selectedAction === "death" && (
            <>
              <RHDatePicker
                name="dateOfDeath"
                control={control}
                label={t("animals.date_of_death")}
                mode="date"
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.dateOfDeath?.message}
              />
              <RHSelect
                name="deathReason"
                control={control}
                label={t("animals.death_reason")}
                data={deathReasonData}
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                }}
                error={errors.deathReason?.message}
              />
            </>
          )}

          {selectedAction === "registered" && (
            <RHSwitch
              name="registered"
              control={control}
              label={t("animals.registered")}
            />
          )}

          {selectedAction === "usage" && (
            <RHSelect
              name="usage"
              control={control}
              label={t("animals.batch_edit.action_set_usage")}
              data={usageData}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.usage?.message}
            />
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
