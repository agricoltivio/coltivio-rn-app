import { TreatmentCreateInput } from "@/api/treatments.api";
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
import { useAnimalByIdQuery, useAnimalsQuery } from "./animals.hooks";
import { useDrugsQuery } from "./drugs.hooks";
import { CreateTreatmentScreenProps } from "./navigation/animals-routes";
import { useCreateTreatmentMutation } from "./treatments.hooks";

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

export function CreateTreatmentScreen({ route, navigation }: CreateTreatmentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const preselectedAnimalId = route.params?.animalId;
  const { animals } = useAnimalsQuery();
  const { drugs } = useDrugsQuery();
  const { animal: preselectedAnimal } = useAnimalByIdQuery(preselectedAnimalId || "", !!preselectedAnimalId);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
  } = useForm<TreatmentFormValues>({
    defaultValues: {
      animalId: preselectedAnimalId || "",
      date: new Date(),
    },
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

  const createTreatmentMutation = useCreateTreatmentMutation(
    () => navigation.goBack(),
    (error) => console.error(error)
  );

  function onSubmit(data: TreatmentFormValues) {
    createTreatmentMutation.mutate({
      animalId: data.animalId,
      drugId: data.drugId || undefined,
      date: data.date.toISOString(),
      name: data.name,
      reason: data.reason,
      notes: data.notes,
      milkUsableDate: data.milkUsableDate?.toISOString(),
      meatUsableDate: data.meatUsableDate?.toISOString(),
    } as TreatmentCreateInput);
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
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || createTreatmentMutation.isPending}
            loading={createTreatmentMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("treatments.new_treatment")}
        keyboardAware
      >
        <H2>{t("treatments.new_treatment")}</H2>

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
            disabled={!!preselectedAnimalId}
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
