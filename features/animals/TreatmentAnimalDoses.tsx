import { Button } from "@/components/buttons/Button";
import { NumberInput } from "@/components/inputs/NumberInput";
import { Body, Subtitle } from "@/theme/Typography";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

export type TreatmentDoseAnimal = {
  id: string;
  name: string;
  earTagNumber: string | null;
  // Stored treatment weight, else the latest weight entry on or before the start date (as on the server).
  // Not editable here.
  weightKg: number | null;
  // Date of the weight entry, null for a weight stored on the treatment
  weightDate: string | null;
  // The weight history is still loading, or failed to load
  weightStatus: "ready" | "loading" | "error";
  // Amount entered by hand earlier, shown instead of the computed one until changed
  manualEffectiveDoseValue: number | null;
};

// Amounts the user typed, keyed by animal id
export type TreatmentEffectiveDoseInputs = Record<string, string>;

export function computeEffectiveDoseValue(
  weightKg: number | null,
  doseValue: number | string | null | undefined,
): number | null {
  const parsedDoseValue =
    typeof doseValue === "number" ? doseValue : parseFloat(doseValue ?? "");
  if (weightKg == null || !Number.isFinite(parsedDoseValue)) return null;
  return Math.round(weightKg * parsedDoseValue * 1000) / 1000;
}

// Weight and amount of every animal for a per-kg dose, stored by the API exactly as sent (it derives nothing).
// The amount is the typed one, else one entered by hand earlier, else dose × weight; a cleared input falls
// back to dose × weight. Amounts that aren't a number of at least 0 are sent as none.
export function treatmentAnimalDosePayload(
  animals: TreatmentDoseAnimal[],
  effectiveDoseInputs: TreatmentEffectiveDoseInputs,
  doseValue: number | string | null | undefined,
) {
  return {
    animalWeights: animals.map((animal) => ({
      animalId: animal.id,
      weightKg: animal.weightKg,
    })),
    effectiveDoseOverrides: animals.map((animal) => {
      const typedInput = effectiveDoseInputs[animal.id];
      if (typedInput !== undefined && typedInput.trim() !== "") {
        const effectiveDoseValue = parseFloat(typedInput);
        return {
          animalId: animal.id,
          effectiveDoseValue:
            Number.isFinite(effectiveDoseValue) && effectiveDoseValue >= 0
              ? effectiveDoseValue
              : null,
        };
      }
      if (typedInput === undefined && animal.manualEffectiveDoseValue != null) {
        return {
          animalId: animal.id,
          effectiveDoseValue: animal.manualEffectiveDoseValue,
        };
      }
      return {
        animalId: animal.id,
        effectiveDoseValue: computeEffectiveDoseValue(
          animal.weightKg,
          doseValue,
        ),
      };
    }),
  };
}

// Per-animal weight (from the animal) and editable effective amount for doses given per kg body weight
export function TreatmentAnimalDoses({
  animals,
  doseValue,
  doseUnitLabel,
  effectiveDoseInputs,
  onEffectiveDoseInputsChange,
  onRetryWeights,
}: {
  animals: TreatmentDoseAnimal[];
  doseValue: string | undefined;
  doseUnitLabel: string;
  effectiveDoseInputs: TreatmentEffectiveDoseInputs;
  onEffectiveDoseInputsChange: (inputs: TreatmentEffectiveDoseInputs) => void;
  // Saving waits for all weights, so a failed load needs a way to try again without leaving the form
  onRetryWeights: () => void;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  if (animals.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: theme.colors.white,
        borderRadius: 10,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        gap: theme.spacing.s,
      }}
    >
      <Subtitle>{t("breeding.weight_per_animal")}</Subtitle>
      {animals.map((animal) => {
        const computedEffectiveDoseValue = computeEffectiveDoseValue(
          animal.weightKg,
          doseValue,
        );
        const shownEffectiveDoseValue =
          animal.manualEffectiveDoseValue ?? computedEffectiveDoseValue;
        const effectiveDoseInput =
          effectiveDoseInputs[animal.id] ??
          (shownEffectiveDoseValue != null
            ? String(shownEffectiveDoseValue)
            : "");
        const label = animal.earTagNumber
          ? `${animal.earTagNumber} - ${animal.name}`
          : animal.name;
        return (
          <View key={animal.id} style={{ gap: theme.spacing.xxs }}>
            {/* Own line so long ear tags and names stay readable */}
            <Body style={{ fontWeight: "600" }}>{label}</Body>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.s,
              }}
            >
              <View style={{ flex: 1 }}>
                <Body style={{ color: theme.colors.gray2 }}>
                  {animal.weightStatus === "loading"
                    ? "…"
                    : animal.weightStatus === "error"
                      ? t("breeding.weight_load_failed")
                      : animal.weightKg == null
                        ? t("breeding.no_weight")
                        : animal.weightDate
                          ? `${animal.weightKg} kg · ${formatLocalizedDate(parseDateOnly(animal.weightDate), i18n.language)}`
                          : `${animal.weightKg} kg`}
                </Body>
              </View>
              <View style={{ width: 140 }}>
                <NumberInput
                  float
                  label={`${t("breeding.amount")}${
                    doseUnitLabel ? ` (${doseUnitLabel})` : ""
                  }`}
                  // A cleared input falls back to dose × weight
                  placeholder={
                    computedEffectiveDoseValue != null
                      ? String(computedEffectiveDoseValue)
                      : "0.0"
                  }
                  value={effectiveDoseInput}
                  onChangeText={(value) =>
                    onEffectiveDoseInputsChange({
                      ...effectiveDoseInputs,
                      [animal.id]: value,
                    })
                  }
                />
              </View>
            </View>
          </View>
        );
      })}
      {animals.some((animal) => animal.weightStatus === "error") && (
        <Button
          type="secondary"
          title={t("buttons.retry")}
          onPress={onRetryWeights}
        />
      )}
    </View>
  );
}
