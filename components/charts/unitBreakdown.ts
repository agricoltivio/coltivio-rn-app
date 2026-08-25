import { formatNumber } from "./unitScaling";

export type UnitBreakdownEntry = {
  label: string;
  count: number;
  amountPerUnit: number;
};

// e.g. "10 crates × 20kg"
export function formatUnitBreakdown(
  entry: UnitBreakdownEntry,
  perUnitLabel: string,
): string {
  return `${formatNumber(entry.count)} ${entry.label} × ${formatNumber(entry.amountPerUnit)}${perUnitLabel}`;
}
