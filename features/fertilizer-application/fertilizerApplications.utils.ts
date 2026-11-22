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
