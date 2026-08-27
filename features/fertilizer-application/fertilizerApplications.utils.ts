import {
  FertilizerApplicationMethod,
  FertilizerApplicationSummary,
} from "@/api/fertilizerApplications.api";

export const fertilizerApplicationMethods: FertilizerApplicationMethod[] = [
  "spread",
  "spray",
  "other",
];

export type FertilizerChartData = Record<
  string,
  { unit: string; monthly: Record<number, number[]> }
>;

// fertilizerName -> { unit, monthly totals per year }, across every year
// present in the summaries. Callers pick which years to render vs. which to
// use as a historical reference (e.g. an all-years average).
export function aggregateFertilizerApplicationsByName(
  summaries: FertilizerApplicationSummary[],
): FertilizerChartData {
  const result: FertilizerChartData = {};
  for (const s of summaries) {
    for (const af of s.appliedFertilizers) {
      if (af.totalAmount === 0) continue;
      if (!result[af.fertilizerName]) {
        result[af.fertilizerName] = { unit: af.unit, monthly: {} };
      }
      const entry = result[af.fertilizerName];
      if (!entry.monthly[s.year]) {
        entry.monthly[s.year] = new Array(12).fill(0);
      }
      entry.monthly[s.year][s.month] += af.totalAmount;
    }
  }
  return result;
}

export type AppliedFertilizerRow = {
  totalAmount: number;
  totalProducedUnits: number;
};

// year -> month (0-11) -> total amount/application count for one fertilizer
export type AppliedFertilizerByYearMonth = Record<
  number,
  Record<number, AppliedFertilizerRow>
>;

export function aggregateAppliedFertilizersByYearMonth(
  summaries: FertilizerApplicationSummary[],
  fertilizerName: string,
): AppliedFertilizerByYearMonth {
  const result: AppliedFertilizerByYearMonth = {};
  for (const s of summaries) {
    for (const af of s.appliedFertilizers) {
      if (af.fertilizerName !== fertilizerName) continue;
      if (!result[s.year]) result[s.year] = {};
      const existing = result[s.year][s.month];
      if (existing) {
        existing.totalAmount += af.totalAmount;
        existing.totalProducedUnits += af.totalProducedUnits;
      } else {
        result[s.year][s.month] = {
          totalAmount: af.totalAmount,
          totalProducedUnits: af.totalProducedUnits,
        };
      }
    }
  }
  return result;
}

// Sums applications for a year from January through the given month
// (inclusive) — used for the cumulative chart view.
export function accumulateAppliedFertilizersUpToMonth(
  byYearMonth: AppliedFertilizerByYearMonth,
  year: number,
  month: number,
): AppliedFertilizerRow {
  const totals: AppliedFertilizerRow = {
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
