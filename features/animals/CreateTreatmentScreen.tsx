import { ApiError } from "@/api/api";
import { toLocalDateString } from "@/utils/date";
import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHSwitch } from "@/components/inputs/RHSwitch";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ListItem } from "@/components/list/ListItem";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { addDays } from "date-fns";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { useAnimalWeightsOnDay } from "./breeding.hooks";
import { useDrugsQuery } from "./drugs.hooks";
import { CreateTreatmentScreenProps } from "./navigation/animals-routes";
import { useCreateTreatmentMutation } from "./treatments.hooks";
import {
  TreatmentAnimalDoses,
  TreatmentDoseAnimal,
  TreatmentEffectiveDoseInputs,
  treatmentAnimalDosePayload,
} from "./TreatmentAnimalDoses";

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

interface TreatmentFormValues {
  withDrug: boolean;
  drugId?: string;
  startDate: Date;
  endDate: Date;
  name: string;
  notes?: string;
  milkUsableDate?: Date;
  meatUsableDate?: Date;
  organsUsableDate?: Date;
  drugDoseValue?: string;
  drugDoseUnit?: DoseUnit;
  drugDosePerUnit?: DosePerUnit;
  drugReceivedFrom?: string;
  isAntibiotic: boolean;
  criticalAntibiotic: boolean;
  antibiogramAvailable: boolean;
}

export function CreateTreatmentScreen({
  route,
  navigation,
}: CreateTreatmentScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  // Memoized: a new array on every render would recompute everything derived from the animals
  const routeAnimalIds = route.params?.animalIds;
  const selectedAnimalIds = useMemo(
    () => routeAnimalIds ?? [],
    [routeAnimalIds],
  );
  const preselectedDrugId = route.params?.drugId;
  const { animals } = useAnimalsQuery();
  const { drugs } = useDrugsQuery();

  const {
    control,
    handleSubmit,
    formState: { errors, dirtyFields },
    watch,
    setValue,
  } = useForm<TreatmentFormValues>({
    defaultValues: {
      withDrug: true,
      startDate: new Date(),
      endDate: new Date(),
      isAntibiotic: false,
      criticalAntibiotic: false,
      antibiogramAvailable: false,
    },
  });

  const withDrug = watch("withDrug");
  const selectedDrugId = watch("drugId");
  const treatmentDate = watch("startDate");
  const endDate = watch("endDate");
  const drugDoseValue = watch("drugDoseValue");
  const drugDoseUnit = watch("drugDoseUnit");
  const drugDosePerUnit = watch("drugDosePerUnit");

  // shouldDirty: true ensures drug-sync effect fires when returning from CreateDrug.
  useEffect(() => {
    if (preselectedDrugId) {
      setValue("drugId", preselectedDrugId, { shouldDirty: true });
    }
  }, [preselectedDrugId, setValue]);

  const selectedAnimals = useMemo(() => {
    return animals?.filter((a) => selectedAnimalIds?.includes(a.id)) ?? [];
  }, [animals, selectedAnimalIds]);

  const selectedDrug = useMemo(() => {
    return drugs?.find((d) => d.id === selectedDrugId);
  }, [drugs, selectedDrugId]);

  // Auto-sync endDate to startDate if endDate hasn't been manually changed
  useEffect(() => {
    if (!dirtyFields.endDate) {
      setValue("endDate", treatmentDate);
    }
  }, [treatmentDate, setValue, dirtyFields.endDate]);

  // One treatment covers one animal type (older ones may mix types, then the first animal's type counts)
  const animalType = selectedAnimals[0]?.type;
  const drugTreatmentForType =
    selectedDrug && animalType
      ? selectedDrug.drugTreatment.find((dt) => dt.animalType === animalType)
      : undefined;
  // The drug has no dose and waiting times for the animal type, the user enters them by hand
  const drugNotDefinedForType =
    selectedDrug && animalType && !drugTreatmentForType
      ? animalType
      : undefined;

  // Proposes the drug's values when the user picks a drug or animals of another type, and shifts the
  // proposed dates when the end date changes. Runs only on these changes, so values entered by hand
  // (e.g. for a drug without values for the animal type) survive other edits.
  const endDay = endDate ? toLocalDateString(endDate) : undefined;
  const previousProposalInputs = useRef<{
    drugId: string | undefined;
    animalType: string | undefined;
    endDay: string | undefined;
  } | null>(null);
  useEffect(() => {
    const drugId = selectedDrugId || undefined;
    // Drug list still loading (e.g. right after creating a drug), propose once it's there
    if (drugId && !selectedDrug) return;
    const previous = previousProposalInputs.current;
    previousProposalInputs.current = { drugId, animalType, endDay };
    if (!previous) return;
    const drugChanged = previous.drugId !== drugId;
    // Animals finishing loading is no change, picking animals after the drug is
    const animalTypeChanged =
      previous.animalType !== animalType &&
      (previous.animalType !== undefined || !!dirtyFields.drugId);
    const endDayChanged = previous.endDay !== endDay;
    if (!drugChanged && !animalTypeChanged && !endDayChanged) return;

    if (!selectedDrug) {
      if (!drugChanged) return;
      // Drug removed: no antibiotic flags, dose or withdrawal period
      setValue("isAntibiotic", false);
      setValue("criticalAntibiotic", false);
      setValue("drugReceivedFrom", undefined);
      setValue("milkUsableDate", undefined);
      setValue("meatUsableDate", undefined);
      setValue("organsUsableDate", undefined);
      setValue("drugDoseValue", undefined);
      setValue("drugDoseUnit", undefined);
      setValue("drugDosePerUnit", undefined);
      return;
    }
    if (drugChanged) {
      setValue("isAntibiotic", selectedDrug.isAntibiotic);
      setValue("criticalAntibiotic", selectedDrug.criticalAntibiotic);
      setValue("drugReceivedFrom", selectedDrug.receivedFrom);
    }
    if (drugTreatmentForType) {
      // The dose only on a new drug or animal type, an end date change keeps a dose changed by hand
      if (drugChanged || animalTypeChanged) {
        setValue("drugDoseValue", String(drugTreatmentForType.doseValue));
        setValue("drugDoseUnit", drugTreatmentForType.doseUnit);
        setValue("drugDosePerUnit", drugTreatmentForType.dosePerUnit);
      }
      if (endDate) {
        setValue(
          "milkUsableDate",
          addDays(endDate, drugTreatmentForType.milkWaitingDays),
        );
        setValue(
          "meatUsableDate",
          addDays(endDate, drugTreatmentForType.meatWaitingDays),
        );
        setValue(
          "organsUsableDate",
          addDays(endDate, drugTreatmentForType.organsWaitingDays),
        );
      }
    } else if (animalType && (drugChanged || animalTypeChanged)) {
      // Nothing to propose, don't keep the values of a previously selected drug or animal type
      setValue("milkUsableDate", undefined);
      setValue("meatUsableDate", undefined);
      setValue("organsUsableDate", undefined);
      setValue("drugDoseValue", undefined);
      setValue("drugDoseUnit", undefined);
      setValue("drugDosePerUnit", undefined);
    }
  }, [
    selectedDrugId,
    selectedDrug,
    drugTreatmentForType,
    animalType,
    endDay,
    endDate,
    dirtyFields.drugId,
    setValue,
  ]);

  // Save errors from the API, e.g. a lost connection
  function showError(error: Error) {
    Alert.alert(
      t("common.error"),
      error instanceof ApiError ? error.message : t("common.unknown_error"),
    );
  }
  const createTreatmentMutation = useCreateTreatmentMutation(
    () => navigation.goBack(),
    showError,
  );

  const [effectiveDoseInputs, setEffectiveDoseInputs] =
    useState<TreatmentEffectiveDoseInputs>({});
  // Typed amounts belong to the drug and per-kg dose they were entered for. Without this they'd come back
  // and be sent after switching to "per animal" and back, or to another drug
  useEffect(() => {
    setEffectiveDoseInputs({});
  }, [drugDosePerUnit, selectedDrugId]);
  // Same weight the server uses: the latest entry on or before the start date, not the newest overall
  const { weightOnDayByAnimalId, isError: weightsFailed } =
    useAnimalWeightsOnDay(
      selectedAnimalIds,
      toLocalDateString(treatmentDate),
      drugDosePerUnit === "kg",
    );
  const doseAnimals: TreatmentDoseAnimal[] = selectedAnimals.map((animal) => {
    const weightOnDay = weightOnDayByAnimalId.get(animal.id) ?? null;
    const weightLoaded = weightOnDayByAnimalId.has(animal.id);
    return {
      id: animal.id,
      name: animal.name,
      earTagNumber: animal.earTag?.number ?? null,
      weightKg: weightOnDay?.weightKg ?? null,
      weightDate: weightOnDay?.date ?? null,
      weightStatus: weightLoaded
        ? "ready"
        : weightsFailed
          ? "error"
          : "loading",
      manualEffectiveDoseValue: null,
    };
  });

  function onSubmit(data: TreatmentFormValues) {
    createTreatmentMutation.mutate({
      animalIds: selectedAnimalIds,
      drugId: data.withDrug ? data.drugId || null : null,
      startDate: toLocalDateString(data.startDate),
      endDate: toLocalDateString(data.endDate),
      name: data.name,
      notes: data.notes,
      // Without a drug there is no withdrawal period and no dose
      milkUsableDate:
        data.withDrug && data.milkUsableDate
          ? toLocalDateString(data.milkUsableDate)
          : null,
      meatUsableDate:
        data.withDrug && data.meatUsableDate
          ? toLocalDateString(data.meatUsableDate)
          : null,
      organsUsableDate:
        data.withDrug && data.organsUsableDate
          ? toLocalDateString(data.organsUsableDate)
          : null,
      drugDoseValue:
        data.withDrug && data.drugDoseValue
          ? parseFloat(data.drugDoseValue)
          : null,
      drugDoseUnit: data.withDrug ? (data.drugDoseUnit ?? null) : null,
      drugDosePerUnit: data.withDrug ? (data.drugDosePerUnit ?? null) : null,
      drugReceivedFrom: data.withDrug ? data.drugReceivedFrom || null : null,
      isAntibiotic: data.withDrug && data.isAntibiotic,
      criticalAntibiotic: data.withDrug && data.criticalAntibiotic,
      antibiogramAvailable: data.withDrug && data.antibiogramAvailable,
      // Weight and amount per animal only for per-kg doses, the API stores them as sent
      ...(data.withDrug && data.drugDosePerUnit === "kg"
        ? treatmentAnimalDosePayload(
            doseAnimals,
            effectiveDoseInputs,
            data.drugDoseValue,
          )
        : { animalWeights: [], effectiveDoseOverrides: [] }),
    });
  }

  const drugSelectData = useMemo(() => {
    const options =
      drugs?.map((drug) => ({
        label: drug.name,
        value: drug.id,
      })) ?? [];
    return [{ label: t("forms.labels.none"), value: "" }, ...options];
  }, [drugs, t]);

  function openSelectAnimalsModal() {
    navigation.navigate("SelectAnimals", {
      initialSelectedIds: selectedAnimalIds,
      previousScreen: "CreateTreatment",
      // One treatment covers one animal type, so the drug's dose and waiting times apply to all of them
      singleAnimalType: true,
    });
  }

  function openCreateDrug() {
    navigation.navigate("CreateDrug", { previousScreen: "CreateTreatment" });
  }

  // Display text for selected animals
  const selectedAnimalsText = useMemo(() => {
    if (selectedAnimals.length === 0) {
      return t("treatments.no_animals_selected");
    }
    if (selectedAnimals.length === 1) {
      const animal = selectedAnimals[0];
      const earTag = animal.earTag?.number ? `${animal.earTag.number} - ` : "";
      return `${earTag}${animal.name}`;
    }
    return t("treatments.n_animals_selected", {
      count: selectedAnimals.length,
    });
  }, [selectedAnimals, t]);

  // Weights still loading or failed to load would be stored as missing, the API no longer looks them up.
  // The same goes for selected animals not known yet (animal list still loading).
  const weightsMissing =
    withDrug &&
    drugDosePerUnit === "kg" &&
    (doseAnimals.length !== selectedAnimalIds.length ||
      doseAnimals.some((animal) => animal.weightStatus !== "ready"));
  // One treatment covers one animal type, so the drug's dose and waiting times apply to all of them
  const mixedAnimalTypes =
    new Set(selectedAnimals.map((animal) => animal.type)).size > 1;
  const canSave =
    selectedAnimalIds.length > 0 && !mixedAnimalTypes && !weightsMissing;

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={!canSave || createTreatmentMutation.isPending}
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
          {/* Animal selection card */}
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 10,
              padding: theme.spacing.m,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
            }}
          >
            <Subtitle style={{ marginBottom: theme.spacing.xs }}>
              {t("treatments.select_animals")}
            </Subtitle>
            <ListItem
              style={{
                backgroundColor: theme.colors.gray4,
                borderRadius: 8,
                paddingVertical: 12,
              }}
              onPress={openSelectAnimalsModal}
            >
              <ListItem.Content>
                <ListItem.Title
                  style={{
                    color:
                      selectedAnimals.length === 0
                        ? theme.colors.gray2
                        : undefined,
                  }}
                >
                  {selectedAnimalsText}
                </ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>
            {mixedAnimalTypes && (
              <Subtitle
                style={{
                  color: theme.colors.danger,
                  marginTop: theme.spacing.xs,
                }}
              >
                {t("treatments.mixed_animal_types")}
              </Subtitle>
            )}
          </View>

          <View style={{ marginTop: theme.spacing.m, gap: theme.spacing.xs }}>
            <RHTextInput
              name="name"
              control={control}
              label={t("treatments.treatment_name")}
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.name?.message}
            />
            <RHDatePicker
              name="startDate"
              control={control}
              label={t("treatments.treatment_date")}
              mode="date"
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.startDate?.message}
            />
            <RHDatePicker
              name="endDate"
              control={control}
              label={t("treatments.treatment_end_date")}
              mode="date"
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.endDate?.message}
            />
          </View>
          {/* Everything that belongs to the drug, grouped like the animal card above */}
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 10,
              padding: theme.spacing.m,
              marginTop: theme.spacing.s,
              borderLeftWidth: 4,
              borderLeftColor: theme.colors.primary,
            }}
          >
            <RHSwitch
              label={t("drugs.drug")}
              control={control}
              name="withDrug"
            />

            {withDrug && (
              <View
                style={{ marginTop: theme.spacing.s, gap: theme.spacing.xs }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.xs,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <RHSelect
                      name="drugId"
                      control={control}
                      label={t("treatments.select_drug")}
                      data={drugSelectData}
                      enableSearch
                      error={errors.drugId?.message}
                    />
                  </View>
                  <IonIconButton
                    icon="add"
                    iconSize={24}
                    color="black"
                    type="accent"
                    onPress={openCreateDrug}
                  />
                </View>

                {drugNotDefinedForType && (
                  <View
                    style={{
                      paddingLeft: theme.spacing.s,
                      borderLeftWidth: 4,
                      borderLeftColor: theme.colors.warning,
                    }}
                  >
                    <Subtitle style={{ color: theme.colors.gray1 }}>
                      {t("treatments.drug_not_defined_for_type", {
                        // Plural names are capitalized labels; only German keeps that mid-sentence
                        type: i18n.language.startsWith("de")
                          ? t(
                              `animals.animal_types_plural.${drugNotDefinedForType}`,
                            )
                          : t(
                              `animals.animal_types_plural.${drugNotDefinedForType}`,
                            ).toLocaleLowerCase(i18n.language),
                      })}
                    </Subtitle>
                  </View>
                )}

                {/* Dose settings, shown once a drug is selected */}
                {selectedDrug && (
                  <View
                    style={{
                      marginVertical: theme.spacing.s,
                    }}
                  >
                    <Subtitle style={{ marginBottom: theme.spacing.s }}>
                      {t("treatments.drug_configuration")}
                    </Subtitle>
                    <View style={{ gap: theme.spacing.xs }}>
                      <RHTextInput
                        name="drugReceivedFrom"
                        control={control}
                        label={t("drugs.received_from")}
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          gap: theme.spacing.xs,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <RHNumberInput
                            name="drugDoseValue"
                            control={control}
                            label={t("drugs.dose_value")}
                            placeholder="0.0"
                            float
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <RHSelect
                            name="drugDoseUnit"
                            control={control}
                            label={t("drugs.dose_unit")}
                            data={DOSE_UNITS.map((u) => ({
                              label: t(`drugs.dose_units.${u}`),
                              value: u,
                            }))}
                          />
                        </View>
                      </View>
                      <RHSelect
                        name="drugDosePerUnit"
                        control={control}
                        label={t("drugs.dose_per_unit")}
                        data={DOSE_PER_UNITS.map((u) => ({
                          label: t(`drugs.dose_per_units.${u}`),
                          value: u,
                        }))}
                      />
                    </View>
                  </View>
                )}

                {selectedDrug && drugDosePerUnit === "kg" && (
                  <TreatmentAnimalDoses
                    animals={doseAnimals}
                    doseValue={drugDoseValue}
                    doseUnitLabel={
                      drugDoseUnit ? t(`drugs.dose_units.${drugDoseUnit}`) : ""
                    }
                    effectiveDoseInputs={effectiveDoseInputs}
                    onEffectiveDoseInputsChange={setEffectiveDoseInputs}
                  />
                )}

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

                <RHDatePicker
                  name="organsUsableDate"
                  control={control}
                  label={t("treatments.organs_usable_date")}
                  mode="date"
                  error={errors.organsUsableDate?.message}
                />

                <RHSwitch
                  style={{ marginVertical: theme.spacing.s }}
                  label={t("drugs.is_antibiotic")}
                  control={control}
                  name="isAntibiotic"
                />

                <RHSwitch
                  style={{ marginVertical: theme.spacing.s }}
                  label={t("drugs.critical_antibiotic")}
                  control={control}
                  name="criticalAntibiotic"
                />

                <RHSwitch
                  style={{ marginVertical: theme.spacing.s }}
                  label={t("treatments.antibiogram_available")}
                  control={control}
                  name="antibiogramAvailable"
                />
              </View>
            )}
          </View>

          <RHTextAreaInput
            name="notes"
            control={control}
            label={t("common.notes")}
            error={errors.notes?.message}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
