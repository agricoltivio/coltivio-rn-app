import { NumberInput } from "@/components/inputs/NumberInput";
import { Body, Subtitle } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

export type TreatmentDoseAnimal = {
  id: string;
  name: string;
  earTagNumber: string | null;
  // Taken from the animal (stored treatment weight or latest weight entry), not editable here
  weightKg: number | null;
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

// Overrides sent to the API: typed amounts and amounts entered by hand earlier.
// Animals without either get the amount computed from dose and weight on the server.
export function treatmentEffectiveDoseOverrides(
  animals: TreatmentDoseAnimal[],
  effectiveDoseInputs: TreatmentEffectiveDoseInputs,
) {
  return animals.flatMap((animal) => {
    const typedInput = effectiveDoseInputs[animal.id];
    if (typedInput !== undefined) {
      const effectiveDoseValue = parseFloat(typedInput);
      return [
        {
          animalId: animal.id,
          effectiveDoseValue:
            Number.isFinite(effectiveDoseValue) && effectiveDoseValue >= 0
              ? effectiveDoseValue
              : null,
        },
      ];
    }
    if (animal.manualEffectiveDoseValue != null) {
      return [
        {
          animalId: animal.id,
          effectiveDoseValue: animal.manualEffectiveDoseValue,
        },
      ];
    }
    return [];
  });
}

// Per-animal weight (from the animal) and editable effective amount for doses given per kg body weight
export function TreatmentAnimalDoses({
  animals,
  doseValue,
  doseUnitLabel,
  effectiveDoseInputs,
  onEffectiveDoseInputsChange,
}: {
  animals: TreatmentDoseAnimal[];
  doseValue: string | undefined;
  doseUnitLabel: string;
  effectiveDoseInputs: TreatmentEffectiveDoseInputs;
  onEffectiveDoseInputsChange: (inputs: TreatmentEffectiveDoseInputs) => void;
}) {
  const { t } = useTranslation();
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
        const shownEffectiveDoseValue =
          animal.manualEffectiveDoseValue ??
          computeEffectiveDoseValue(animal.weightKg, doseValue);
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
                  {animal.weightKg != null
                    ? `${animal.weightKg} kg`
                    : t("breeding.no_weight")}
                </Body>
              </View>
              <View style={{ width: 140 }}>
                <NumberInput
                  float
                  label={`${t("breeding.amount")}${
                    doseUnitLabel ? ` (${doseUnitLabel})` : ""
                  }`}
                  placeholder="0.0"
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
    </View>
  );
}
