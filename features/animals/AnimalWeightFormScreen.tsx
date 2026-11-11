import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { parseDateOnly, toLocalDateString } from "@/utils/date";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useAnimalWeightsQuery,
  useCreateAnimalWeightMutation,
  useDeleteAnimalWeightMutation,
  useUpdateAnimalWeightMutation,
} from "./breeding.hooks";
import { AnimalWeightFormScreenProps } from "./navigation/animals-routes";

type WeightFormValues = {
  date: Date;
  weightKg: string;
  notes?: string;
};

export function AnimalWeightFormScreen({
  route,
  navigation,
}: AnimalWeightFormScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { animalId, weightId } = route.params;
  const isEditMode = !!weightId;
  const { weights } = useAnimalWeightsQuery(animalId, isEditMode);
  const existingWeight = weights?.find((weight) => weight.id === weightId);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WeightFormValues>({
    defaultValues: { date: new Date(), weightKg: "" },
    values: existingWeight
      ? {
          date: parseDateOnly(existingWeight.date),
          weightKg: String(existingWeight.weightKg),
          notes: existingWeight.notes ?? undefined,
        }
      : undefined,
  });

  const createMutation = useCreateAnimalWeightMutation(() =>
    navigation.goBack(),
  );
  const updateMutation = useUpdateAnimalWeightMutation(() =>
    navigation.goBack(),
  );
  const deleteMutation = useDeleteAnimalWeightMutation(() =>
    navigation.goBack(),
  );

  // The screen stays open on failure, tell the user instead of doing nothing
  function showError() {
    Alert.alert(t("common.error"), t("common.unknown_error"));
  }

  function onSubmit(values: WeightFormValues) {
    const input = {
      date: toLocalDateString(values.date),
      weightKg: parseFloat(values.weightKg),
      notes: values.notes || null,
    };
    if (weightId) {
      updateMutation.mutate({ weightId, input }, { onError: showError });
    } else {
      createMutation.mutate({ animalId, input }, { onError: showError });
    }
  }

  function onDelete() {
    if (!weightId) return;
    Alert.alert(t("breeding.delete_weight_entry"), undefined, [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: () => deleteMutation.mutate(weightId),
      },
    ]);
  }

  const isBusy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;
  const title = isEditMode
    ? t("breeding.edit_weight")
    : t("breeding.add_weight_entry");

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
            {isEditMode && (
              <Button
                style={{ flexGrow: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={onDelete}
                disabled={isBusy}
              />
            )}
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={isBusy}
              loading={createMutation.isPending || updateMutation.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={title} keyboardAware>
        <H2>{title}</H2>
        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.xs }}>
          <RHDatePicker
            name="date"
            control={control}
            label={t("breeding.date")}
            mode="date"
            clearable={false}
            // A weighing can't be in the future; it would become the latest weight and the dose prefill
            maximumDate={new Date()}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.date?.message}
          />
          <RHNumberInput
            name="weightKg"
            control={control}
            label={t("breeding.weight_kg")}
            placeholder="0.0"
            float
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
              validate: (value) =>
                parseFloat(String(value)) > 0 || t("breeding.weight_positive"),
            }}
            error={errors.weightKg?.message}
          />
          <RHTextAreaInput
            name="notes"
            control={control}
            label={t("breeding.notes_optional")}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
