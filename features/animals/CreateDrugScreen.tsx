import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateDrugMutation } from "./drugs.hooks";
import { CreateDrugScreenProps } from "./navigation/animals-routes";
import { DrugCreateInput } from "@/api/drugs.api";

type AnimalType =
  | "goat"
  | "sheep"
  | "cow"
  | "horse"
  | "donkey"
  | "pig"
  | "deer";

interface TreatmentDefFormValues {
  animalType: AnimalType;
  dosePerKgInMl: string;
  milkWaitingDays: string;
  meatWaitingDays: string;
}

interface DrugFormValues {
  name: string;
  notes?: string;
  drugTreatment: TreatmentDefFormValues[];
}

const ANIMAL_TYPES: AnimalType[] = [
  "goat",
  "sheep",
  "cow",
  "horse",
  "donkey",
  "pig",
  "deer",
];

export function CreateDrugScreen({ navigation }: CreateDrugScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DrugFormValues>({
    defaultValues: {
      name: "",
      notes: "",
      drugTreatment: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "drugTreatment",
  });

  const createDrugMutation = useCreateDrugMutation(
    () => navigation.goBack(),
    (error) => console.error(error),
  );

  const watchedTreatments = watch("drugTreatment");
  const usedTypes = new Set(watchedTreatments?.map((d) => d.animalType) ?? []);
  const canAddMore = usedTypes.size < ANIMAL_TYPES.length;

  function addTreatmentDef() {
    const availableType = ANIMAL_TYPES.find((type) => !usedTypes.has(type));
    if (availableType) {
      append({
        animalType: availableType,
        dosePerKgInMl: "",
        milkWaitingDays: "",
        meatWaitingDays: "",
      });
    }
  }

  function onSubmit(data: DrugFormValues) {
    const drugTreatment = data.drugTreatment.map((def) => ({
      animalType: def.animalType,
      dosePerKgInMl: parseFloat(def.dosePerKgInMl),
      milkWaitingDays: parseInt(def.milkWaitingDays, 10),
      meatWaitingDays: parseInt(def.meatWaitingDays, 10),
    }));

    createDrugMutation.mutate({
      name: data.name,
      notes: data.notes,
      drugTreatment,
    } as DrugCreateInput);
  }

  const nameValue = watch("name");
  const isValid =
    nameValue?.length > 0 &&
    (watchedTreatments ?? []).every(
      (def) =>
        def.dosePerKgInMl &&
        parseFloat(def.dosePerKgInMl) > 0 &&
        def.milkWaitingDays &&
        parseInt(def.milkWaitingDays, 10) >= 0 &&
        def.meatWaitingDays &&
        parseInt(def.meatWaitingDays, 10) >= 0,
    );

  const animalTypeOptions = ANIMAL_TYPES.map((type) => ({
    label: t(`animals.animal_types.${type}`),
    value: type,
  }));

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || createDrugMutation.isPending}
            loading={createDrugMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("drugs.new_drug")}
        keyboardAware
      >
        <H2>{t("drugs.new_drug")}</H2>

        <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.xs }}>
          <RHTextInput
            label={t("drugs.drug_name")}
            control={control}
            name="name"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.name?.message}
          />

          <RHTextAreaInput
            label={t("common.notes")}
            control={control}
            name="notes"
          />
        </View>

        <View style={{ marginTop: theme.spacing.l }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: theme.spacing.s,
            }}
          >
            <H3 style={{ flex: 1 }}>{t("drugs.treatment_definitions")}</H3>
            {canAddMore && (
              <IonIconButton
                icon="add"
                color="black"
                iconSize={25}
                type="accent"
                onPress={addTreatmentDef}
              />
            )}
          </View>

          {fields.length === 0 && (
            <Subtitle>{t("drugs.no_treatment_definitions")}</Subtitle>
          )}

          {fields.map((field, index) => {
            const currentType = watchedTreatments?.[index]?.animalType;
            const availableTypes = ANIMAL_TYPES.filter(
              (type) => type === currentType || !usedTypes.has(type),
            );
            const filteredOptions = animalTypeOptions.filter((opt) =>
              availableTypes.includes(opt.value as AnimalType),
            );

            return (
              <View
                key={field.id}
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: 10,
                  padding: theme.spacing.m,
                  marginBottom: theme.spacing.s,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: theme.spacing.s,
                  }}
                >
                  <Subtitle style={{ flex: 1 }}>
                    {t(`animals.animal_types.${currentType}`)}
                  </Subtitle>
                  <IonIconButton
                    icon="trash"
                    color="red"
                    iconSize={25}
                    type="accent"
                    onPress={() => remove(index)}
                  />
                </View>

                <View style={{ gap: theme.spacing.xs }}>
                  <RHSelect
                    name={`drugTreatment.${index}.animalType`}
                    control={control}
                    label={t("forms.labels.type")}
                    data={filteredOptions}
                    error={errors.drugTreatment?.[index]?.animalType?.message}
                  />

                  <RHNumberInput
                    name={`drugTreatment.${index}.dosePerKgInMl`}
                    control={control}
                    label={t("drugs.dose_ml_per_kg")}
                    placeholder="0.0"
                    float
                    error={
                      errors.drugTreatment?.[index]?.dosePerKgInMl?.message
                    }
                  />

                  <RHNumberInput
                    name={`drugTreatment.${index}.milkWaitingDays`}
                    control={control}
                    label={t("drugs.milk_waiting_days")}
                    placeholder="0"
                    error={
                      errors.drugTreatment?.[index]?.milkWaitingDays?.message
                    }
                  />

                  <RHNumberInput
                    name={`drugTreatment.${index}.meatWaitingDays`}
                    control={control}
                    label={t("drugs.meat_waiting_days")}
                    placeholder="0"
                    error={
                      errors.drugTreatment?.[index]?.meatWaitingDays?.message
                    }
                  />
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ContentView>
  );
}
