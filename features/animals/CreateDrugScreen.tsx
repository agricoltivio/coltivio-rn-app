import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHSwitch } from "@/components/inputs/RHSwitch";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateDrugMutation } from "./drugs.hooks";
import { CreateDrugScreenProps } from "./navigation/animals-routes";

type AnimalType =
  | "goat"
  | "sheep"
  | "cow"
  | "horse"
  | "donkey"
  | "pig"
  | "deer";

type DoseUnit =
  | "tablet"
  | "capsule"
  | "patch"
  | "dose"
  | "mg"
  | "mcg"
  | "g"
  | "ml"
  | "drop";
type DosePerUnit = "kg" | "animal" | "day" | "total_amount";

interface TreatmentDefFormValues {
  animalType: AnimalType;
  doseValue: string;
  doseUnit: DoseUnit;
  dosePerUnit: DosePerUnit;
  milkWaitingDays: string;
  meatWaitingDays: string;
  organsWaitingDays: string;
}

interface DrugFormValues {
  name: string;
  notes?: string;
  isAntibiotic: boolean;
  criticalAntibiotic: boolean;
  receivedFrom: string;
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

const DOSE_UNITS: DoseUnit[] = [
  "ml",
  "g",
  "mg",
  "mcg",
  "tablet",
  "capsule",
  "patch",
  "dose",
  "drop",
];

const DOSE_PER_UNITS: DosePerUnit[] = ["animal", "kg", "day", "total_amount"];

export function CreateDrugScreen({ route, navigation }: CreateDrugScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const previousScreen = route.params?.previousScreen;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DrugFormValues>({
    defaultValues: {
      name: "",
      notes: "",
      isAntibiotic: false,
      criticalAntibiotic: false,
      receivedFrom: "",
      drugTreatment: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "drugTreatment",
  });

  const createDrugMutation = useCreateDrugMutation(
    (drug) => {
      if (previousScreen) {
        navigation.popTo(
          previousScreen,
          {
            drugId: drug.id,
          },
          { merge: true },
        );
      } else {
        navigation.goBack();
      }
    },
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
        doseValue: "",
        doseUnit: "ml",
        dosePerUnit: "animal",
        milkWaitingDays: "",
        meatWaitingDays: "",
        organsWaitingDays: "",
      });
    }
  }

  function onSubmit(data: DrugFormValues) {
    const drugTreatment = data.drugTreatment.map((def) => ({
      animalType: def.animalType,
      doseValue: parseFloat(def.doseValue),
      doseUnit: def.doseUnit,
      dosePerUnit: def.dosePerUnit,
      milkWaitingDays: parseInt(def.milkWaitingDays, 10),
      meatWaitingDays: parseInt(def.meatWaitingDays, 10),
      organsWaitingDays: parseInt(def.organsWaitingDays, 10),
    }));

    createDrugMutation.mutate({
      name: data.name,
      notes: data.notes,
      isAntibiotic: data.isAntibiotic,
      criticalAntibiotic: data.criticalAntibiotic,
      receivedFrom: data.receivedFrom,
      drugTreatment,
    });
  }

  const nameValue = watch("name");
  const receivedFromValue = watch("receivedFrom");
  const isValid =
    nameValue?.length > 0 &&
    receivedFromValue?.length > 0 &&
    (watchedTreatments ?? []).every(
      (def) =>
        def.doseValue &&
        parseFloat(def.doseValue) > 0 &&
        def.doseUnit &&
        def.dosePerUnit &&
        def.milkWaitingDays &&
        parseInt(def.milkWaitingDays, 10) >= 0 &&
        def.meatWaitingDays &&
        parseInt(def.meatWaitingDays, 10) >= 0 &&
        def.organsWaitingDays &&
        parseInt(def.organsWaitingDays, 10) >= 0,
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

          <RHTextInput
            label={t("drugs.received_from")}
            control={control}
            name="receivedFrom"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.receivedFrom?.message}
          />

          <RHSwitch
            label={t("drugs.is_antibiotic")}
            control={control}
            name="isAntibiotic"
          />

          <RHSwitch
            label={t("drugs.critical_antibiotic")}
            control={control}
            name="criticalAntibiotic"
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

                  {/* Dose inputs grouped together */}
                  <View
                    style={{
                      flexDirection: "row",
                      gap: theme.spacing.xs,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <RHNumberInput
                        name={`drugTreatment.${index}.doseValue`}
                        control={control}
                        label={t("drugs.dose_value")}
                        placeholder="0.0"
                        float
                        error={
                          errors.drugTreatment?.[index]?.doseValue?.message
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <RHSelect
                        name={`drugTreatment.${index}.doseUnit`}
                        control={control}
                        label={t("drugs.dose_unit")}
                        data={DOSE_UNITS.map((u) => ({
                          label: t(`drugs.dose_units.${u}`),
                          value: u,
                        }))}
                        error={errors.drugTreatment?.[index]?.doseUnit?.message}
                      />
                    </View>
                  </View>
                  <RHSelect
                    name={`drugTreatment.${index}.dosePerUnit`}
                    control={control}
                    label={t("drugs.dose_per_unit")}
                    data={DOSE_PER_UNITS.map((u) => ({
                      label: t(`drugs.dose_per_units.${u}`),
                      value: u,
                    }))}
                    error={errors.drugTreatment?.[index]?.dosePerUnit?.message}
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

                  <RHNumberInput
                    name={`drugTreatment.${index}.organsWaitingDays`}
                    control={control}
                    label={t("drugs.organs_waiting_days")}
                    placeholder="0"
                    error={
                      errors.drugTreatment?.[index]?.organsWaitingDays?.message
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
