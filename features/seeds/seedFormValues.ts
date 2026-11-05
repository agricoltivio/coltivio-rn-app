import { SeedQuantityKind } from "@/api/seeds.api";
import { SowingUnit, SowingUnitInfo } from "@/api/sowings.api";
import { SeedFormValues } from "./SeedForm";

const SEED_QUANTITY_KINDS: SeedQuantityKind[] = ["weight", "count"];

export function parseQuantityKind(value: string): SeedQuantityKind | undefined {
  return SEED_QUANTITY_KINDS.find((kind) => kind === value);
}

/**
 * A unit can be saved on its own (it's preselected in a sowing), an amount only
 * together with a unit.
 */
export function seedDefaultRateFromForm(
  values: SeedFormValues,
  sowingUnits: SowingUnitInfo[],
): { defaultAmount: number | null; defaultUnit: SowingUnit | null } {
  const defaultUnit = sowingUnits.find(
    (unitInfo) => unitInfo.unit === values.defaultUnit,
  )?.unit;
  const defaultAmount =
    values.defaultAmount != null && values.defaultAmount !== ""
      ? Number(values.defaultAmount)
      : NaN;
  if (!defaultUnit) {
    return { defaultAmount: null, defaultUnit: null };
  }
  return {
    defaultAmount: Number.isNaN(defaultAmount) ? null : defaultAmount,
    defaultUnit,
  };
}
