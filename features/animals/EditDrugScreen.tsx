import { Button } from "@/components/buttons/Button";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { NumberInput } from "@/components/inputs/NumberInput";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHTextAreaInput } from "@/components/inputs/RHTextAreaInput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, H3, Subtitle } from "@/theme/Typography";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCheckDrugInUseMutation, useDeleteDrugMutation, useDrugByIdQuery, useUpdateDrugMutation } from "./drugs.hooks";
import { EditDrugScreenProps } from "./navigation/animals-routes";
import { Picker } from "@react-native-picker/picker";
import { DrugUpdateInput } from "@/api/drugs.api";

interface DrugFormValues {
  name: string;
  notes?: string;
}

type AnimalType = "goat" | "sheep" | "cow" | "horse" | "donkey" | "pig" | "deer";

interface TreatmentDef {
  animalType: AnimalType;
  dosePerKg: string;
  milkWaitingDays: string;
  meatWaitingDays: string;
}

const ANIMAL_TYPES: AnimalType[] = ["goat", "sheep", "cow", "horse", "donkey", "pig", "deer"];

export function EditDrugScreen({ route, navigation }: EditDrugScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const drugId = route.params.drugId;
  const { drug } = useDrugByIdQuery(drugId);
  const [treatmentDefs, setTreatmentDefs] = useState<TreatmentDef[]>([]);

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
        }
      : undefined,
  });

  useEffect(() => {
    if (drug?.drugTreatment) {
      setTreatmentDefs(
        drug.drugTreatment.map((def) => ({
          animalType: def.animalType,
          dosePerKg: String(def.dosePerKg),
          milkWaitingDays: String(def.milkWaitingDays),
          meatWaitingDays: String(def.meatWaitingDays),
        }))
      );
    }
  }, [drug]);

  const updateDrugMutation = useUpdateDrugMutation(() => navigation.goBack());
  const deleteDrugMutation = useDeleteDrugMutation(() => navigation.goBack());
  const checkDrugInUseMutation = useCheckDrugInUseMutation();

  function addTreatmentDef() {
    const usedTypes = new Set(treatmentDefs.map((d) => d.animalType));
    const availableType = ANIMAL_TYPES.find((type) => !usedTypes.has(type));
    if (availableType) {
      setTreatmentDefs([
        ...treatmentDefs,
        {
          animalType: availableType,
          dosePerKg: "",
          milkWaitingDays: "",
          meatWaitingDays: "",
        },
      ]);
    }
  }

  function removeTreatmentDef(index: number) {
    setTreatmentDefs(treatmentDefs.filter((_, i) => i !== index));
  }

  function updateTreatmentDef(index: number, field: keyof TreatmentDef, value: string) {
    const updated = [...treatmentDefs];
    updated[index] = { ...updated[index], [field]: value };
    setTreatmentDefs(updated);
  }

  function onSubmit(data: DrugFormValues) {
    const drugTreatment = treatmentDefs.map((def) => ({
      animalType: def.animalType as any,
      dosePerKg: parseFloat(def.dosePerKg),
      milkWaitingDays: parseInt(def.milkWaitingDays, 10),
      meatWaitingDays: parseInt(def.meatWaitingDays, 10),
    }));

    updateDrugMutation.mutate({
      id: drugId,
      name: data.name,
      notes: data.notes,
      drugTreatment,
    } as DrugUpdateInput & { id: string });
  }

  async function onDelete() {
    try {
      const result = await checkDrugInUseMutation.mutateAsync(drugId);
      if (result.inUse) {
        Alert.alert(
          t("drugs.drug_in_use"),
          t("drugs.drug_in_use_warning"),
          [{ text: t("buttons.ok") }]
        );
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

  const usedTypes = new Set(treatmentDefs.map((d) => d.animalType));
  const canAddMore = usedTypes.size < ANIMAL_TYPES.length;
  const hasChanges = isDirty || JSON.stringify(treatmentDefs) !== JSON.stringify(
    drug.drugTreatment.map((def) => ({
      animalType: def.animalType,
      dosePerKg: String(def.dosePerKg),
      milkWaitingDays: String(def.milkWaitingDays),
      meatWaitingDays: String(def.meatWaitingDays),
    }))
  );
  const isValid = watch("name")?.length > 0 && treatmentDefs.every((def) =>
    def.dosePerKg && parseFloat(def.dosePerKg) > 0 &&
    def.milkWaitingDays && parseInt(def.milkWaitingDays, 10) >= 0 &&
    def.meatWaitingDays && parseInt(def.meatWaitingDays, 10) >= 0
  );

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
              loading={deleteDrugMutation.isPending || checkDrugInUseMutation.isPending}
            />
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={
                !hasChanges ||
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

        <View style={{ marginTop: theme.spacing.m }}>
          <RHTextInput
            label={t("drugs.drug_name")}
            control={control}
            name="name"
            rules={{ required: true }}
            error={errors.name?.message}
          />

          <RHTextAreaInput
            label={t("common.notes")}
            control={control}
            name="notes"
          />
        </View>

        <View style={{ marginTop: theme.spacing.l }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.s }}>
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

          {treatmentDefs.length === 0 && (
            <Subtitle>{t("drugs.no_treatment_definitions")}</Subtitle>
          )}

          {treatmentDefs.map((def, index) => {
            const availableTypes = ANIMAL_TYPES.filter(
              (type) => type === def.animalType || !usedTypes.has(type)
            );

            return (
              <View
                key={index}
                style={{
                  backgroundColor: theme.colors.white,
                  borderRadius: 10,
                  padding: theme.spacing.m,
                  marginBottom: theme.spacing.s,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: theme.spacing.s }}>
                  <Subtitle style={{ flex: 1 }}>
                    {t(`animals.animal_types.${def.animalType}`)}
                  </Subtitle>
                  <IonIconButton
                    icon="trash"
                    color="red"
                    iconSize={20}
                    type="danger"
                    onPress={() => removeTreatmentDef(index)}
                  />
                </View>

                <View style={{ height: 50, marginBottom: theme.spacing.s }}>
                  <Picker
                    selectedValue={def.animalType}
                    onValueChange={(value) => updateTreatmentDef(index, "animalType", value)}
                  >
                    {availableTypes.map((type) => (
                      <Picker.Item
                        key={type}
                        label={t(`animals.animal_types.${type}`)}
                        value={type}
                      />
                    ))}
                  </Picker>
                </View>

                <NumberInput
                  label={t("drugs.dose_per_kg")}
                  value={def.dosePerKg}
                  onChangeText={(value) => updateTreatmentDef(index, "dosePerKg", value)}
                  placeholder="0.0"
                />

                <NumberInput
                  label={t("drugs.milk_waiting_days")}
                  value={def.milkWaitingDays}
                  onChangeText={(value) => updateTreatmentDef(index, "milkWaitingDays", value)}
                  placeholder="0"
                />

                <NumberInput
                  label={t("drugs.meat_waiting_days")}
                  value={def.meatWaitingDays}
                  onChangeText={(value) => updateTreatmentDef(index, "meatWaitingDays", value)}
                  placeholder="0"
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </ContentView>
  );
}
