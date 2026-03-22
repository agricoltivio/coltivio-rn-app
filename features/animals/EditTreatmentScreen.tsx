import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { RHSwitch } from "@/components/inputs/RHSwitch";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { ListItem } from "@/components/list/ListItem";
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
import {
  useDeleteTreatmentMutation,
  useTreatmentByIdQuery,
  useUpdateTreatmentMutation,
} from "./treatments.hooks";

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

export function EditTreatmentScreen({
  route,
  navigation,
}: EditTreatmentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const treatmentId = route.params.treatmentId!;
  const preselectedDrugId = route.params?.drugId;
  const { treatment } = useTreatmentByIdQuery(treatmentId);
  const { animals } = useAnimalsQuery();
  const { drugs } = useDrugsQuery();

  const selectedAnimalIds =
    route.params?.animalIds ??
    treatment?.animals.map((animal) => animal.id) ??
    [];

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    setValue,
  } = useForm<TreatmentFormValues>({
    values: treatment
      ? {
          drugId: treatment.drugId || undefined,
          startDate: new Date(treatment.startDate),
          endDate: new Date(treatment.endDate),
          name: treatment.name,
          notes: treatment.notes || undefined,
          milkUsableDate: treatment.milkUsableDate
            ? new Date(treatment.milkUsableDate)
            : undefined,
          meatUsableDate: treatment.meatUsableDate
            ? new Date(treatment.meatUsableDate)
            : undefined,
          organsUsableDate: treatment.organsUsableDate
            ? new Date(treatment.organsUsableDate)
            : undefined,
          drugDoseValue: treatment.drugDoseValue
            ? String(treatment.drugDoseValue)
            : undefined,
          drugDoseUnit: treatment.drugDoseUnit ?? undefined,
          drugDosePerUnit: treatment.drugDosePerUnit ?? undefined,
          drugReceivedFrom: treatment.drugReceivedFrom ?? undefined,
          isAntibiotic: treatment.isAntibiotic,
          criticalAntibiotic: treatment.criticalAntibiotic,
          antibiogramAvailable: treatment.antibiogramAvailable,
        }
      : undefined,
  });

  // Apply preselected drug (e.g. after creating a new drug via the + button).
  // shouldDirty: true ensures drug-sync effect fires when returning from CreateDrug.
  useEffect(() => {
    if (preselectedDrugId) {
      setValue("drugId", preselectedDrugId, { shouldDirty: true });
    }
  }, [preselectedDrugId, setValue]);

  const selectedDrugId = useWatch({ control, name: "drugId" });
  const endDate = useWatch({ control, name: "endDate" });

  const selectedAnimals = useMemo(() => {
    return animals?.filter((a) => selectedAnimalIds.includes(a.id)) ?? [];
  }, [animals, selectedAnimalIds]);

  const selectedDrug = useMemo(() => {
    return drugs?.find((d) => d.id === selectedDrugId);
  }, [drugs, selectedDrugId]);

  // Validation for drug + multiple animal types
  const drugValidation = useMemo(() => {
    if (!selectedDrug || selectedAnimals.length === 0) {
      return { valid: true };
    }

    const animalTypes = [...new Set(selectedAnimals.map((a) => a.type))];
    const drugDefs = animalTypes.map((type) => {
      const def = selectedDrug.drugTreatment.find(
        (dt) => dt.animalType === type,
      );
      return def
        ? {
            type,
            milk: def.milkWaitingDays,
            meat: def.meatWaitingDays,
            organs: def.organsWaitingDays,
            doseValue: def.doseValue,
            doseUnit: def.doseUnit,
            dosePerUnit: def.dosePerUnit,
          }
        : null;
    });

    // Check if any type has no definition
    if (drugDefs.some((d) => d === null)) {
      return {
        valid: false,
        error: t("treatments.drug_not_defined_for_all_types"),
      };
    }

    // Check if all waiting times are the same
    const first = drugDefs[0]!;
    const allSame = drugDefs.every(
      (d) =>
        d!.milk === first.milk &&
        d!.meat === first.meat &&
        d!.organs === first.organs,
    );

    if (!allSame) {
      return {
        valid: false,
        error: t("treatments.different_waiting_times_for_types"),
      };
    }

    return {
      valid: true,
      milkDays: first.milk,
      meatDays: first.meat,
      organsDays: first.organs,
      doseValue: first.doseValue,
      doseUnit: first.doseUnit,
      dosePerUnit: first.dosePerUnit,
    };
  }, [selectedDrug, selectedAnimals, t]);

  // Sync drug-derived fields only when user explicitly changed the drug.
  // dirtyFields.drugId is false when values prop resets the form (async load / refetch).
  useEffect(() => {
    if (!dirtyFields.drugId) return;
    if (selectedDrug) {
      setValue("isAntibiotic", selectedDrug.isAntibiotic, {
        shouldDirty: true,
      });
      setValue("criticalAntibiotic", selectedDrug.criticalAntibiotic, {
        shouldDirty: true,
      });
      setValue("drugReceivedFrom", selectedDrug.receivedFrom, {
        shouldDirty: true,
      });
      if (
        drugValidation.valid &&
        drugValidation.milkDays !== undefined &&
        endDate
      ) {
        setValue("milkUsableDate", addDays(endDate, drugValidation.milkDays), {
          shouldDirty: true,
        });
        setValue("meatUsableDate", addDays(endDate, drugValidation.meatDays!), {
          shouldDirty: true,
        });
        setValue(
          "organsUsableDate",
          addDays(endDate, drugValidation.organsDays!),
          { shouldDirty: true },
        );
        setValue("drugDoseValue", String(drugValidation.doseValue), {
          shouldDirty: true,
        });
        setValue("drugDoseUnit", drugValidation.doseUnit, {
          shouldDirty: true,
        });
        setValue("drugDosePerUnit", drugValidation.dosePerUnit, {
          shouldDirty: true,
        });
      }
    } else {
      setValue("isAntibiotic", false, { shouldDirty: true });
      setValue("criticalAntibiotic", false, { shouldDirty: true });
      setValue("drugReceivedFrom", undefined, { shouldDirty: true });
      setValue("milkUsableDate", undefined, { shouldDirty: true });
      setValue("meatUsableDate", undefined, { shouldDirty: true });
      setValue("organsUsableDate", undefined, { shouldDirty: true });
      setValue("drugDoseValue", undefined, { shouldDirty: true });
      setValue("drugDoseUnit", undefined, { shouldDirty: true });
      setValue("drugDosePerUnit", undefined, { shouldDirty: true });
    }
  }, [
    selectedDrugId,
    selectedDrug,
    dirtyFields.drugId,
    drugValidation,
    endDate,
    setValue,
  ]);

  // Recalculate waiting dates when end date changes.
  // Dose fields intentionally excluded so user overrides survive date changes.
  useEffect(() => {
    if (
      drugValidation.valid &&
      drugValidation.milkDays !== undefined &&
      endDate
    ) {
      setValue("milkUsableDate", addDays(endDate, drugValidation.milkDays));
      setValue("meatUsableDate", addDays(endDate, drugValidation.meatDays!));
      setValue(
        "organsUsableDate",
        addDays(endDate, drugValidation.organsDays!),
      );
    }
  }, [endDate, drugValidation, setValue]);

  const updateTreatmentMutation = useUpdateTreatmentMutation(() =>
    navigation.goBack(),
  );
  const deleteTreatmentMutation = useDeleteTreatmentMutation(() =>
    navigation.goBack(),
  );

  const drugSelectData = useMemo(() => {
    const options =
      drugs?.map((drug) => ({
        label: drug.name,
        value: drug.id,
      })) ?? [];
    return [{ label: t("forms.labels.none"), value: "" }, ...options];
  }, [drugs, t]);

  if (!treatment) {
    return null;
  }

  function onSubmit(data: TreatmentFormValues) {
    updateTreatmentMutation.mutate({
      id: treatmentId,
      animalIds: selectedAnimalIds,
      drugId: data.drugId || null,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      name: data.name,
      notes: data.notes,
      milkUsableDate: data.milkUsableDate?.toISOString() ?? null,
      meatUsableDate: data.meatUsableDate?.toISOString() ?? null,
      organsUsableDate: data.organsUsableDate?.toISOString() ?? null,
      drugDoseValue: data.drugDoseValue ? parseFloat(data.drugDoseValue) : null,
      drugDoseUnit: data.drugDoseUnit ?? null,
      drugDosePerUnit: data.drugDosePerUnit ?? null,
      drugReceivedFrom: data.drugReceivedFrom || null,
      isAntibiotic: data.isAntibiotic,
      criticalAntibiotic: data.criticalAntibiotic,
      antibiogramAvailable: data.antibiogramAvailable,
    });
  }

  function onDelete() {
    deleteTreatmentMutation.mutate(treatmentId);
  }

  function openSelectAnimalsModal() {
    navigation.navigate("SelectAnimals", {
      initialSelectedIds: selectedAnimalIds,
      previousScreen: "EditTreatment",
    });
  }

  // Display text for selected animals
  const selectedAnimalsText = (() => {
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
  })();

  // Check if animals changed from initial
  const initialAnimalIds = treatment.animals?.map((a) => a.id) ?? [];
  const animalsChanged =
    selectedAnimalIds.length !== initialAnimalIds.length ||
    selectedAnimalIds.some((id: string) => !initialAnimalIds.includes(id));

  const canSave =
    selectedAnimalIds.length > 0 &&
    drugValidation.valid &&
    (isDirty || animalsChanged);

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
                !canSave ||
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
              {t("treatments.select_animal")}
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
          </View>

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
              onPress={() =>
                navigation.navigate("CreateDrug", {
                  previousScreen: "EditTreatment",
                })
              }
            />
          </View>

          {/* Drug validation warning */}
          {!drugValidation.valid && drugValidation.error && (
            <View
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 10,
                padding: theme.spacing.m,
                borderLeftWidth: 4,
                borderLeftColor: theme.colors.yellow,
              }}
            >
              <Subtitle style={{ color: theme.colors.gray1 }}>
                {drugValidation.error}
              </Subtitle>
            </View>
          )}

          {/* Dose settings card - only shown when drug is selected */}
          {selectedDrug && drugValidation.valid && (
            <View
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 10,
                padding: theme.spacing.m,
                marginTop: theme.spacing.xs,
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
            label={t("drugs.is_antibiotic")}
            control={control}
            name="isAntibiotic"
          />

          <RHSwitch
            label={t("drugs.critical_antibiotic")}
            control={control}
            name="criticalAntibiotic"
          />

          <RHSwitch
            label={t("treatments.antibiogram_available")}
            control={control}
            name="antibiogramAvailable"
          />

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
