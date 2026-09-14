import { round } from "./math";

// Narrow view of i18next's `t` — just the string-returning call shape this
// module needs. The real `t` from useTranslation() satisfies it.
type TranslateFn = (key: string, options?: { defaultValue?: string }) => string;

type Unit = "ml" | "l" | "g" | "kg" | "dt" | "t";

type UnitGroup = "volume" | "weight";

const unitGroups: Record<Unit, UnitGroup> = {
  ml: "volume",
  l: "volume",
  g: "weight",
  kg: "weight",
  dt: "weight",
  t: "weight",
};

const conversionFactors: Record<Unit, number> = {
  // volume (in liters)
  ml: 0.001,
  l: 1,

  // weight (in kg)
  g: 0.001,
  kg: 1,
  dt: 100,
  t: 1000,
};

// Check if two units are compatible (same group)
export function areUnitsCompatible(unitA: Unit, unitB: Unit): boolean {
  return unitGroups[unitA] === unitGroups[unitB];
}

// Convert from one unit to another (must be compatible)
export function convertUnit(value: number, from: Unit, to: Unit): number {
  if (!areUnitsCompatible(from, to)) {
    throw new Error(`Incompatible units: ${from} and ${to}`);
  }

  const group = unitGroups[from];

  if (group === "volume") {
    // Convert to liters, then to target
    const inLiters = value * conversionFactors[from];
    return inLiters / conversionFactors[to];
  } else if (group === "weight") {
    // Convert to kilograms, then to target
    const inKg = value * conversionFactors[from];
    return inKg / conversionFactors[to];
  }

  throw new Error(`Unknown unit group: ${group}`);
}

export type ApplicationUnit =
  | "load"
  | "bag"
  | "total_amount"
  | "amount_per_hectare"
  | "other";

// Builds the applied-amount label shown in the field-calendar list rows for
// fertilizer and crop-protection applications.
//   - total_amount:       the total product amount followed by the product unit
//                         symbol with no space, e.g. "5t"
//   - amount_per_hectare: the per-hectare rate followed by the product unit
//                         symbol and "/ha", e.g. "400kg/ha"
//   - load / bag / other: the number of units followed by the translated unit
//                         word with a space, e.g. "5 Fuder"
export function formatApplicationAmount(
  params: {
    unit: ApplicationUnit;
    numberOfUnits: number;
    amountPerUnit: number;
    productUnit: string;
  },
  t: TranslateFn,
): string {
  const { unit, numberOfUnits, amountPerUnit, productUnit } = params;

  if (unit === "total_amount") {
    return `${round(numberOfUnits * amountPerUnit, 2)}${productUnit}`;
  }

  if (unit === "amount_per_hectare") {
    return `${round(amountPerUnit, 2)}${productUnit}/${t("units.short.ha")}`;
  }

  const unitLabel = t(`fertilizer_application.units.${unit}`, {
    defaultValue: unit,
  });
  return `${round(numberOfUnits, 2)} ${unitLabel}`;
}
