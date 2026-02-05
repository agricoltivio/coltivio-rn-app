import { TreatmentUpdateInput } from "@/api/treatments.api";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { addDays } from "date-fns";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { useDrugsQuery } from "./drugs.hooks";
import { EditTreatmentScreenProps } from "./navigation/animals-routes";
import { useDeleteTreatmentMutation, useTreatmentByIdQuery, useUpdateTreatmentMutation } from "./treatments.hooks";

interface TreatmentFormValues {
  animalId: string;
  drugId?: string;
  date: Date;
  name: string;
  reason: string;
  notes?: string;
  milkUsableDate?: Date;
  meatUsableDate?: Date;
}

export function EditTreatmentScreen({ route, navigation }: EditTreatmentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const treatmentId = route.params.treatmentId;
  const { treatment } = useTreatmentByIdQuery(treatmentId);
  const { animals } = useAnimalsQuery();
  const { drugs } = useDrugsQuery();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
  } = useForm<TreatmentFormValues>({
    values: treatment
      ? {
          animalId: treatment.animalId,
          drugId: treatment.drugId || undefined,
          date: new Date(treatment.date),
          name: treatment.name,
          reason: treatment.reason,
          notes: treatment.notes || undefined,
          milkUsableDate: treatment.milkUsableDate ? new Date(treatment.milkUsableDate) : undefined,
          meatUsableDate: treatment.meatUsableDate ? new Date(treatment.meatUsableDate) : undefined,
        }
      : undefined,
  });

  const selectedAnimalId = useWatch({ control, name: "animalId" });
  const selectedDrugId = useWatch({ control, name: "drugId" });
  const treatmentDate = useWatch({ control, name: "date" });

  const selectedAnimal = useMemo(() => {
    return animals?.find((a) => a.id === selectedAnimalId);
  }, [animals, selectedAnimalId]);

  const selectedDrug = useMemo(() => {
    return drugs?.find((d) => d.id === selectedDrugId);
  }, [drugs, selectedDrugId]);

  // Auto-calculate usable dates when drug or date changes
  useEffect(() => {
    if (selectedDrug && selectedAnimal && treatmentDate) {
      const drugTreatment = selectedDrug.drugTreatment.find(
        (dt) => dt.animalType === selectedAnimal.type
      );
      if (drugTreatment) {
        setValue("milkUsableDate", addDays(treatmentDate, drugTreatment.milkWaitingDays));
        setValue("meatUsableDate", addDays(treatmentDate, drugTreatment.meatWaitingDays));
      }
    }
  }, [selectedDrug, selectedAnimal, treatmentDate, setValue]);

  const updateTreatmentMutation = useUpdateTreatmentMutation(() => navigation.goBack());
  const deleteTreatmentMutation = useDeleteTreatmentMutation(() => navigation.goBack());

  function onSubmit(data: TreatmentFormValues) {
    updateTreatmentMutation.mutate({
      id: treatmentId,
      animalId: data.animalId,
      drugId: data.drugId || undefined,
      date: data.date.toISOString(),
      name: data.name,
      reason: data.reason,
      notes: data.notes,
      milkUsableDate: data.milkUsableDate?.toISOString(),
      meatUsableDate: data.meatUsableDate?.toISOString(),
    } as TreatmentUpdateInput & { id: string });
  }

  function onDelete() {
    deleteTreatmentMutation.mutate(treatmentId);
  }

  if (!treatment) {
    return null;
  }

  const animalSelectData = useMemo(() => {
    return animals?.map((animal) => ({
      label: `${animal.name} (${t(`animals.animal_types.${animal.type}`)})`,
      value: animal.id,
    })) ?? [];
  }, [animals, t]);

  const drugSelectData = useMemo(() => {
    return drugs?.map((drug) => ({
      label: drug.name,
      value: drug.id,
    })) ?? [];
  }, [drugs]);

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.s,
            }}
          >
            <Button
              style={{ flexGrow: 1 }}
              type="danger"
              title={t("buttons.delete")}
              onPress={onDelete}
              disabled={
                updateTreatmentMutation.isPending ||
                deleteTreatmentMutation.isPending
              }
              loading={deleteTreatmentMutation.isPending}
            />
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={
                !isDirty ||
                updateTreatmentMutation.isPending ||
                deleteTreatmentMutation.isPending
              }
              loading={updateTreatmentMutation.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={treatment.name}
        keyboardAware
      >
        <H2>{treatment.name}</H2>

        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.xs }}>
          <RHSelect
            name="animalId"
            control={control}
            label={t("treatments.select_animal")}
            rules={{
              required: { value: true, message: t("forms.validation.required") },
            }}
            error={errors.animalId?.message}
            data={animalSelectData}
            enableSearch
          />

          <RHDatePicker
            name="date"
            control={control}
            label={t("treatments.treatment_date")}
            mode="date"
            rules={{
              required: { value: true, message: t("forms.validation.required") },
            }}
            error={errors.date?.message}
          />

          <RHSelect
            name="drugId"
            control={control}
            label={t("treatments.select_drug")}
            data={drugSelectData}
            enableSearch
            error={errors.drugId?.message}
          />

          <RHTextInput
            name="name"
            control={control}
            label={t("treatments.treatment_name")}
            rules={{
              required: { value: true, message: t("forms.validation.required") },
            }}
            error={errors.name?.message}
          />

          <RHTextInput
            name="reason"
            control={control}
            label={t("treatments.reason")}
            rules={{
              required: { value: true, message: t("forms.validation.required") },
            }}
            error={errors.reason?.message}
          />

          <RHDatePicker
            name="milkUsableDate"
            control={control}
            label={t("treatments.milk_usable_date")}
            mode="date"
            error={errors.milkUsableDate?.message}
          />

          <RHDatePicker
            name="meatUsableDate"
            control={control}
            label={t("treatments.meat_usable_date")}
            mode="date"
            error={errors.meatUsableDate?.message}
          />

          <RHTextAreaInput
            name="notes"
            control={control}
            label={t("common.notes")}
            error={errors.notes?.message}
          />

          {selectedDrug && selectedAnimal && (
            <Subtitle style={{ marginTop: theme.spacing.s }}>
              {t("treatments.auto_calculated")}
            </Subtitle>
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
