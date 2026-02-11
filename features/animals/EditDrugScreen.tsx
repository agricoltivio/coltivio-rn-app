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
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import {
  useCheckDrugInUseMutation,
  useDeleteDrugMutation,
  useDrugByIdQuery,
  useUpdateDrugMutation,
} from "./drugs.hooks";
import { EditDrugScreenProps } from "./navigation/animals-routes";

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

export function EditDrugScreen({ route, navigation }: EditDrugScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const drugId = route.params.drugId!;
  const { drug } = useDrugByIdQuery(drugId);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<DrugFormValues>({
    values: drug
      ? {
          name: drug.name,
          notes: drug.notes || undefined,
          criticalAntibiotic: drug.criticalAntibiotic,
          receivedFrom: drug.receivedFrom,
          drugTreatment: drug.drugTreatment.map((def) => ({
            animalType: def.animalType,
            doseValue: String(def.doseValue),
            doseUnit: def.doseUnit,
            dosePerUnit: def.dosePerUnit,
            milkWaitingDays: String(def.milkWaitingDays),
            meatWaitingDays: String(def.meatWaitingDays),
            organsWaitingDays: String(def.organsWaitingDays),
          })),
        }
      : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "drugTreatment",
  });

  const updateDrugMutation = useUpdateDrugMutation(() => navigation.goBack());
  const deleteDrugMutation = useDeleteDrugMutation(() => navigation.goBack());
  const checkDrugInUseMutation = useCheckDrugInUseMutation();

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

    updateDrugMutation.mutate({
      id: drugId!,
      name: data.name,
      notes: data.notes,
      drugTreatment,
    });
  }

  async function onDelete() {
    try {
      const result = await checkDrugInUseMutation.mutateAsync(drugId);
      if (result.inUse) {
        Alert.alert(t("drugs.drug_in_use"), t("drugs.drug_in_use_warning"), [
          { text: t("buttons.ok") },
        ]);
      } else {
        deleteDrugMutation.mutate(drugId);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (!drug) {
    return null;
  }

  const nameValue = watch("name");
  const isValid =
    nameValue?.length > 0 &&
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
                updateDrugMutation.isPending ||
                deleteDrugMutation.isPending ||
                checkDrugInUseMutation.isPending
              }
              loading={
                deleteDrugMutation.isPending || checkDrugInUseMutation.isPending
              }
            />
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={
                !isDirty ||
                !isValid ||
                updateDrugMutation.isPending ||
                deleteDrugMutation.isPending
              }
              loading={updateDrugMutation.isPending}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={drug.name}
        keyboardAware
      >
        <H2>{drug.name}</H2>

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
              marginBottom: theme.spacing.m,
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
                  marginBottom: theme.spacing.m,
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
