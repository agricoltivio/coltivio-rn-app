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

export type UnitBreakdownRow = {
  unit: string;
  totalAmountInKilos: number;
  totalProducedUnits: number;
};

// year -> month (0-11) -> unit-type breakdown (e.g. crate vs. bale) for one
// crop + conservation method
export type ProducedUnitsByYearMonth = Record<
  number,
  Record<number, UnitBreakdownRow[]>
>;

export function aggregateProducedUnitsByYearMonth(
  summaries: HarvestSummary[],
  cropName: string,
  conservationMethod: string,
): ProducedUnitsByYearMonth {
  const byYearMonth: Record<
    number,
    Record<number, Record<string, UnitBreakdownRow>>
  > = {};
  for (const s of summaries) {
    for (const pq of s.producedQuantities) {
      if (pq.forageName !== cropName) continue;
      if ((pq.conservationMethod ?? "none") !== conservationMethod) continue;
      if (!byYearMonth[s.year]) byYearMonth[s.year] = {};
      if (!byYearMonth[s.year][s.month]) byYearMonth[s.year][s.month] = {};
      const months = byYearMonth[s.year][s.month];
      for (const pu of pq.producedUnits) {
        const existing = months[pu.unit];
        if (existing) {
          existing.totalAmountInKilos += pu.totalAmountInKilos;
          existing.totalProducedUnits += pu.totalProducedUnits;
        } else {
          months[pu.unit] = { ...pu };
        }
      }
    }
  }

  const result: ProducedUnitsByYearMonth = {};
  for (const [year, months] of Object.entries(byYearMonth)) {
    result[Number(year)] = {};
    for (const [month, units] of Object.entries(months)) {
      result[Number(year)][Number(month)] = sortByUnitOrder(
        Object.values(units),
      );
    }
  }
  return result;
}

// Stable display order (crate before bale before load, etc.) instead of
// relying on object key insertion order; unknown units sort last.
function sortByUnitOrder(rows: UnitBreakdownRow[]): UnitBreakdownRow[] {
  return [...rows].sort(
    (a, b) => unitOrderIndex(a.unit) - unitOrderIndex(b.unit),
  );
}
function unitOrderIndex(unit: string): number {
  const index = harvestingUnits.findIndex((u) => u === unit);
  return index === -1 ? harvestingUnits.length : index;
}

// Sums the unit-type breakdown for a year from January through the given month
// (inclusive) — used for the cumulative chart view, where the tapped point
// represents a running total rather than a single month.
export function accumulateProducedUnitsUpToMonth(
  byYearMonth: ProducedUnitsByYearMonth,
  year: number,
  month: number,
): UnitBreakdownRow[] {
  const months = byYearMonth[year];
  if (!months) return [];
  const totals: Record<string, UnitBreakdownRow> = {};
  for (let m = 0; m <= month; m++) {
    for (const row of months[m] ?? []) {
      const existing = totals[row.unit];
      if (existing) {
        existing.totalAmountInKilos += row.totalAmountInKilos;
        existing.totalProducedUnits += row.totalProducedUnits;
      } else {
        totals[row.unit] = { ...row };
      }
    }
  }
  return sortByUnitOrder(Object.values(totals));
}
