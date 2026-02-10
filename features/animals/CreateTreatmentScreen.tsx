import { TreatmentCreateInput } from "@/api/treatments.api";
import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ListItem } from "@/components/list/ListItem";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import { addDays } from "date-fns";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useAnimalsQuery } from "./animals.hooks";
import { useDrugsQuery } from "./drugs.hooks";
import { CreateTreatmentScreenProps } from "./navigation/animals-routes";
import { useCreateTreatmentMutation } from "./treatments.hooks";

interface TreatmentFormValues {
  drugId?: string;
  date: Date;
  name: string;
  notes?: string;
  milkUsableDate?: Date;
  meatUsableDate?: Date;
}

export function CreateTreatmentScreen({
  route,
  navigation,
}: CreateTreatmentScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const selectedAnimalIds = route.params?.animalIds ?? [];
  const preselectedDrugId = route.params?.drugId;
  const { animals } = useAnimalsQuery();
  const { drugs } = useDrugsQuery();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TreatmentFormValues>({
    defaultValues: {
      date: new Date(),
    },
  });

  const selectedDrugId = watch("drugId");
  const treatmentDate = watch("date");

  useEffect(() => {
    if (preselectedDrugId) {
      setValue("drugId", preselectedDrugId);
    }
  }, [preselectedDrugId, setValue]);

  const selectedAnimals = useMemo(() => {
    return animals?.filter((a) => selectedAnimalIds?.includes(a.id)) ?? [];
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
    const waitingTimes = animalTypes.map((type) => {
      const def = selectedDrug.drugTreatment.find(
        (dt) => dt.animalType === type,
      );
      return def
        ? { type, milk: def.milkWaitingDays, meat: def.meatWaitingDays }
        : null;
    });

    // Check if any type has no definition
    if (waitingTimes.some((wt) => wt === null)) {
      return {
        valid: false,
        error: t("treatments.drug_not_defined_for_all_types"),
      };
    }

    // Check if all waiting times are the same
    const firstMilk = waitingTimes[0]!.milk;
    const firstMeat = waitingTimes[0]!.meat;
    const allSame = waitingTimes.every(
      (wt) => wt!.milk === firstMilk && wt!.meat === firstMeat,
    );

    if (!allSame) {
      return {
        valid: false,
        error: t("treatments.different_waiting_times_for_types"),
      };
    }

    return { valid: true, milkDays: firstMilk, meatDays: firstMeat };
  }, [selectedDrug, selectedAnimals, t]);

  // Auto-calculate usable dates when drug or date changes
  useEffect(() => {
    if (
      drugValidation.valid &&
      drugValidation.milkDays !== undefined &&
      treatmentDate
    ) {
      setValue(
        "milkUsableDate",
        addDays(treatmentDate, drugValidation.milkDays),
      );
      setValue(
        "meatUsableDate",
        addDays(treatmentDate, drugValidation.meatDays!),
      );
    }
  }, [drugValidation, treatmentDate, setValue]);

  const createTreatmentMutation = useCreateTreatmentMutation(
    () => navigation.goBack(),
    (error) => console.error(error),
  );

  function onSubmit(data: TreatmentFormValues) {
    createTreatmentMutation.mutate({
      animalIds: selectedAnimalIds,
      drugId: data.drugId || null,
      date: data.date.toISOString(),
      name: data.name,
      notes: data.notes,
      milkUsableDate: data.milkUsableDate?.toISOString() ?? null,
      meatUsableDate: data.meatUsableDate?.toISOString() ?? null,
    } as TreatmentCreateInput);
  }

  const drugSelectData = useMemo(() => {
    return (
      drugs?.map((drug) => ({
        label: drug.name,
        value: drug.id,
      })) ?? []
    );
  }, [drugs]);

  function openSelectAnimalsModal() {
    navigation.navigate("SelectAnimals", {
      initialSelectedIds: selectedAnimalIds,
      previousScreen: "CreateTreatment",
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

  const canSave = selectedAnimalIds.length > 0 && drugValidation.valid;

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

          <View style={{ marginTop: theme.spacing.m }}>
            <RHDatePicker
              name="date"
              control={control}
              label={t("treatments.treatment_date")}
              mode="date"
              rules={{
                required: {
                  value: true,
                  message: t("forms.validation.required"),
                },
              }}
              error={errors.date?.message}
            />
          </View>
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

          <RHTextAreaInput
            name="notes"
            control={control}
            label={t("common.notes")}
            error={errors.notes?.message}
          />

          {selectedDrug &&
            selectedAnimals.length > 0 &&
            drugValidation.valid && (
              <Subtitle style={{ marginTop: theme.spacing.s }}>
                {t("treatments.auto_calculated")}
              </Subtitle>
            )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
