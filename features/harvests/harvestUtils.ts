import {
  ConservationMethod,
  HarvestSummary,
  HarvestUnit,
} from "@/api/harvests.api";

export const harvestingUnits: HarvestUnit[] = [
  "load",
  "square_bale",
  "round_bale",
  "crate",
  "total_amount",
];

export const conservationsMethods: ConservationMethod[] = [
  "none",
  "dried",
  "haylage",
  "silage",
  "other",
];

export function isConservationMethod(
  value: string,
): value is ConservationMethod {
  return conservationsMethods.some((m) => m === value);
}

export type CropData = Record<
  string,
  Record<
    string,
    { total: Record<number, number>; monthly: Record<number, number[]> }
  >
>;

// crop -> conservationMethod -> { total per year, monthly totals per year },
// across every year present in the summaries. Callers pick which years to
// render vs. which to use as a historical reference (e.g. an all-years
// average) — this aggregates everything once rather than being re-filtered
// per selection.
export function aggregateHarvestsByCropAndMethod(
  summaries: HarvestSummary[],
): CropData {
  const result: CropData = {};
  for (const s of summaries) {
    for (const pq of s.producedQuantities) {
      if (pq.totalAmountInKilos === 0) continue;
      const cm = pq.conservationMethod ?? "none";
      if (!result[pq.forageName]) result[pq.forageName] = {};
      if (!result[pq.forageName][cm]) {
        result[pq.forageName][cm] = { total: {}, monthly: {} };
      }
      const entry = result[pq.forageName][cm];
      if (!entry.monthly[s.year]) {
        entry.monthly[s.year] = new Array(12).fill(0);
        entry.total[s.year] = 0;
      }
      entry.monthly[s.year][s.month] += pq.totalAmountInKilos;
      entry.total[s.year] += pq.totalAmountInKilos;
    }
  }
  return result;
}
