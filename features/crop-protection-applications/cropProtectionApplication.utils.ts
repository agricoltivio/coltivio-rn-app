import {
  CropProtectionApplicationMethod,
  CropProtectionApplicationSummary,
} from "@/api/cropProtectionApplications.api";
import { CropProtectionUnit } from "@/api/cropProtectionProducts.api";

export const methodSelectData = [
  {
    value: "broadcasting",
    label: getMethodLabel("broadcasting"),
  },
  {
    value: "injektion",
    label: getMethodLabel("injecting"),
  },
  {
    value: "misting",
    label: getMethodLabel("misting"),
  },
  {
    value: "spraying",
    label: getMethodLabel("spraying"),
  },
  {
    value: "other",
    label: getMethodLabel("other"),
  },
];

export function getMethodLabel(method: CropProtectionApplicationMethod) {
  const labels: Record<CropProtectionApplicationMethod, string> = {
    broadcasting: "Flächendeckend",
    injecting: "Injektion",
    misting: "Vernebeln",
    spraying: "Sprühen",
    other: "Andere",
  };

  return labels[method];
}

export function getUnitLabel(unit: CropProtectionUnit) {
  const labels: Record<CropProtectionUnit, string> = {
    kg: "Kilogramm",
    l: "Liter",
    ml: "Milliliter",
    g: "Gramm",
  };
  return labels[unit];
}

export type CropProtectionChartData = Record<
  string,
  { unit: string; monthly: Record<number, number[]> }
>;

// productName -> { unit, monthly totals per year }, across every year
// present in the summaries. Callers pick which years to render vs. which to
// use as a historical reference (e.g. an all-years average).
export function aggregateCropProtectionApplicationsByProduct(
  summaries: CropProtectionApplicationSummary[],
): CropProtectionChartData {
  const result: CropProtectionChartData = {};
  for (const s of summaries) {
    for (const ap of s.appliedCropProtections) {
      if (ap.totalAmount === 0) continue;
      if (!result[ap.productName]) {
        result[ap.productName] = { unit: ap.unit, monthly: {} };
      }
      const entry = result[ap.productName];
      if (!entry.monthly[s.year]) {
        entry.monthly[s.year] = new Array(12).fill(0);
      }
      entry.monthly[s.year][s.month] += ap.totalAmount;
    }
  }
  return result;
}

export type AppliedCropProtectionRow = {
  totalAmount: number;
  totalProducedUnits: number;
};

// year -> month (0-11) -> total amount/application count for one product
export type AppliedCropProtectionByYearMonth = Record<
  number,
  Record<number, AppliedCropProtectionRow>
>;

export function aggregateAppliedCropProtectionsByYearMonth(
  summaries: CropProtectionApplicationSummary[],
  productName: string,
): AppliedCropProtectionByYearMonth {
  const result: AppliedCropProtectionByYearMonth = {};
  for (const s of summaries) {
    for (const ap of s.appliedCropProtections) {
      if (ap.productName !== productName) continue;
      if (!result[s.year]) result[s.year] = {};
      const existing = result[s.year][s.month];
      if (existing) {
        existing.totalAmount += ap.totalAmount;
        existing.totalProducedUnits += ap.totalProducedUnits;
      } else {
        result[s.year][s.month] = {
          totalAmount: ap.totalAmount,
          totalProducedUnits: ap.totalProducedUnits,
        };
      }
    }
  }
  return result;
}

// Sums applications for a year from January through the given month
// (inclusive) — used for the cumulative chart view.
export function accumulateAppliedCropProtectionsUpToMonth(
  byYearMonth: AppliedCropProtectionByYearMonth,
  year: number,
  month: number,
): AppliedCropProtectionRow {
  const totals: AppliedCropProtectionRow = {
    totalAmount: 0,
    totalProducedUnits: 0,
  };
  const months = byYearMonth[year];
  if (!months) return totals;
  for (let m = 0; m <= month; m++) {
    const row = months[m];
    if (!row) continue;
    totals.totalAmount += row.totalAmount;
    totals.totalProducedUnits += row.totalProducedUnits;
  }
  return totals;
}
