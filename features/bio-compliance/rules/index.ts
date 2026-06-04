// MVP baked Bio-Compliance rules (client-side, indicative only).
// Pure functions over already-fetched API data. No persistence, no backend.
// Logically identical mirror in coltivio-web (src/lib/bioCompliance). v2 moves
// this to the backend.
// See coltivio-internal/market-research/biosuisse-compliance-module-feasibility.md (section 8).

import {
  ANTIBIOTIC_MAX_PER_YEAR,
  ANTIBIOTIC_MAX_PER_YEAR_SHORT_LIVED,
  RAUS_VEGETATION_MIN_DAYS,
  RAUS_WINTER_MIN_DAYS,
  SHORT_LIVED_LIFECYCLE_DAYS,
  VEGETATION_MONTHS,
} from "./constants";
import {
  BioAnimal,
  BioFertilizerApplication,
  BioOutdoorEntry,
  BioRotation,
  BioTreatment,
  CheckDomain,
  CheckId,
  CheckResult,
  FailingItem,
} from "./types";

const MS_PER_DAY = 86_400_000;

function noData(id: CheckId, domain: CheckDomain): CheckResult {
  return { id, domain, status: "no_data", failingCount: 0, items: [] };
}

function passFail(
  id: CheckId,
  domain: CheckDomain,
  items: FailingItem[],
): CheckResult {
  return {
    id,
    domain,
    status: items.length > 0 ? "fail" : "ok",
    failingCount: items.length,
    items,
  };
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

// Expand a (possibly recurring) rotation into concrete date ranges.
function expandRanges(
  rotation: BioRotation,
  timelineEnd: Date,
): Array<{ from: Date; to: Date }> {
  const from = new Date(rotation.fromDate);
  const to = new Date(rotation.toDate);
  if (!rotation.recurrence) return [{ from, to }];
  const until = rotation.recurrence.until
    ? new Date(rotation.recurrence.until)
    : null;
  const effectiveUntil = until && until < timelineEnd ? until : timelineEnd;
  const durationMs = to.getTime() - from.getTime();
  const ranges: Array<{ from: Date; to: Date }> = [];
  let current = new Date(from);
  let iterations = 0;
  while (current <= effectiveUntil && iterations < 100) {
    ranges.push({
      from: new Date(current),
      to: new Date(current.getTime() + durationMs),
    });
    current = addYears(current, rotation.recurrence.interval);
    iterations++;
  }
  return ranges;
}

// --- Field checks ---

/** Anbaupause: same crop/family recurs on a plot before its waiting time elapses. */
export function checkRotationPause(rotations: BioRotation[]): CheckResult {
  if (rotations.length === 0) return noData("rotationPause", "field");

  const byPlot = new Map<string, BioRotation[]>();
  for (const r of rotations) {
    const arr = byPlot.get(r.plotId) ?? [];
    arr.push(r);
    byPlot.set(r.plotId, arr);
  }

  const timelineEnd = new Date(new Date().getFullYear() + 1, 11, 31);
  const items: FailingItem[] = [];

  for (const plotRotations of byPlot.values()) {
    type Expanded = {
      rotationId: string;
      cropName: string;
      groupKey: string;
      waitingYears: number;
      from: Date;
      to: Date;
    };
    const expanded: Expanded[] = [];
    for (const r of plotRotations) {
      const waitingYears =
        r.crop.waitingTimeInYears ?? r.crop.family?.waitingTimeInYears ?? 0;
      if (waitingYears <= 0) continue;
      const groupKey = r.crop.familyId
        ? `family:${r.crop.familyId}`
        : `crop:${r.crop.id}`;
      for (const range of expandRanges(r, timelineEnd)) {
        expanded.push({
          rotationId: r.id,
          cropName: r.crop.name,
          groupKey,
          waitingYears,
          from: range.from,
          to: range.to,
        });
      }
    }

    const groups = new Map<string, Expanded[]>();
    for (const e of expanded) {
      const g = groups.get(e.groupKey) ?? [];
      g.push(e);
      groups.set(e.groupKey, g);
    }

    const plotName = plotRotations[0].plot?.name ?? plotRotations[0].plotId;
    const flagged = new Set<string>();
    for (const group of groups.values()) {
      const sorted = [...group].sort(
        (a, b) => a.from.getTime() - b.from.getTime(),
      );
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          if (sorted[i].to > sorted[j].from) continue; // overlap, not a gap
          const gapDays = Math.round(
            (sorted[j].from.getTime() - sorted[i].from.getTime()) / MS_PER_DAY,
          );
          const requiredYears = Math.max(
            sorted[i].waitingYears,
            sorted[j].waitingYears,
          );
          const requiredDays = Math.round(requiredYears * 365.25);
          if (gapDays < requiredDays) {
            for (const e of [sorted[i], sorted[j]]) {
              if (flagged.has(e.rotationId)) continue;
              flagged.add(e.rotationId);
              items.push({
                label: plotName,
                detail: `${e.cropName} (${requiredYears}J)`,
                link: { kind: "rotationPlot", plotId: plotRotations[0].plotId },
              });
            }
          }
        }
      }
    }
  }

  return passFail("rotationPause", "field", items);
}

/** Any mineral (synthetic) fertilizer application is forbidden under Knospe. */
export function checkMineralFertilizer(
  applications: BioFertilizerApplication[],
): CheckResult {
  if (applications.length === 0) return noData("mineralFertilizer", "field");
  const items: FailingItem[] = applications
    .filter((a) => a.fertilizer.type === "mineral")
    .map((a) => ({
      label: a.fertilizer.name,
      detail: `${new Date(a.date).toLocaleDateString()} · ${a.plot?.name ?? ""}`,
      link: { kind: "fertilizerApplication", id: a.id } as const,
    }));
  return passFail("mineralFertilizer", "field", items);
}

// --- Animal checks ---

function isShortLived(animal: BioAnimal): boolean {
  if (!animal.dateOfDeath) return false;
  const lifespanDays =
    (new Date(animal.dateOfDeath).getTime() -
      new Date(animal.dateOfBirth).getTime()) /
    MS_PER_DAY;
  return lifespanDays < SHORT_LIVED_LIFECYCLE_DAYS;
}

/** More than the allowed number of antibiotic treatments per animal per year. */
export function checkAntibioticCount(
  treatments: BioTreatment[],
  animals: BioAnimal[],
): CheckResult {
  if (animals.length === 0) return noData("antibioticCount", "animal");

  const counts = new Map<string, Map<number, number>>();
  for (const t of treatments) {
    if (!t.isAntibiotic) continue;
    const year = new Date(t.startDate).getFullYear();
    for (const a of t.animals) {
      const perYear = counts.get(a.id) ?? new Map<number, number>();
      perYear.set(year, (perYear.get(year) ?? 0) + 1);
      counts.set(a.id, perYear);
    }
  }

  const animalById = new Map(animals.map((a) => [a.id, a]));
  const items: FailingItem[] = [];
  for (const [animalId, perYear] of counts) {
    const animal = animalById.get(animalId);
    const limit =
      animal && isShortLived(animal)
        ? ANTIBIOTIC_MAX_PER_YEAR_SHORT_LIVED
        : ANTIBIOTIC_MAX_PER_YEAR;
    for (const [year, count] of perYear) {
      if (count > limit) {
        items.push({
          label: animal?.name ?? animalId,
          detail: `${count}× ${year} (max ${limit})`,
          link: { kind: "animal", id: animalId },
        });
      }
    }
  }

  return passFail("antibioticCount", "animal", items);
}

/** Critical antibiotics used without a documented antibiogram. */
export function checkCriticalAntibiotic(
  treatments: BioTreatment[],
): CheckResult {
  if (treatments.length === 0) return noData("criticalAntibiotic", "animal");
  const items: FailingItem[] = treatments
    .filter((t) => t.criticalAntibiotic && !t.antibiogramAvailable)
    .map((t) => ({
      label: t.name || "?",
      detail: `${new Date(t.startDate).toLocaleDateString()} · ${t.animals
        .map((a) => a.name)
        .slice(0, 3)
        .join(", ")}`,
      link: { kind: "treatment", id: t.id } as const,
    }));
  return passFail("criticalAntibiotic", "animal", items);
}

/**
 * Informational: animals currently inside the bio (doubled) withdrawal window.
 * bio end = usable + (usable - end). No marketing-violation detection.
 */
export function checkWithdrawalStatus(
  treatments: BioTreatment[],
  kindLabels: Record<"milk" | "meat" | "organs", string>,
): CheckResult {
  if (treatments.length === 0) return noData("withdrawalStatus", "animal");
  const now = Date.now();
  const items: FailingItem[] = [];
  for (const t of treatments) {
    const end = new Date(t.endDate).getTime();
    const kinds: Array<["milk" | "meat" | "organs", string | null]> = [
      ["milk", t.milkUsableDate],
      ["meat", t.meatUsableDate],
      ["organs", t.organsUsableDate],
    ];
    for (const [kind, usable] of kinds) {
      if (!usable) continue;
      const u = new Date(usable).getTime();
      const bioEnd = u + (u - end);
      if (bioEnd > now) {
        items.push({
          label: t.animals.map((a) => a.name).slice(0, 3).join(", ") || t.name,
          detail: `${kindLabels[kind]} → ${new Date(bioEnd).toLocaleDateString()}`,
          link: { kind: "treatment", id: t.id },
        });
      }
    }
  }
  return {
    id: "withdrawalStatus",
    domain: "animal",
    status: items.length > 0 ? "info" : "ok",
    failingCount: items.length,
    items,
  };
}

/**
 * Indicative cattle RAUS coverage from the (planned) outdoor schedule.
 * Cattle = Swiss livestock categories starting with "A".
 */
export function checkRausCoverage(
  entries: BioOutdoorEntry[],
  year: number,
  hasCattle: boolean,
): CheckResult {
  if (!hasCattle) return noData("rausCoverage", "animal");
  const cattle = entries.filter((e) => e.category.startsWith("A"));
  if (cattle.length === 0) return noData("rausCoverage", "animal");

  const yearStart = new Date(year, 0, 1).getTime();
  const yearEnd = new Date(year, 11, 31, 23, 59, 59).getTime();
  const monthDays: Set<number>[] = Array.from({ length: 12 }, () => new Set());

  for (const e of cattle) {
    let cursor = Math.max(new Date(e.startDate).getTime(), yearStart);
    const end = Math.min(new Date(e.endDate).getTime(), yearEnd);
    while (cursor <= end) {
      const d = new Date(cursor);
      monthDays[d.getMonth()].add(d.getDate());
      cursor += MS_PER_DAY;
    }
  }

  const items: FailingItem[] = [];
  for (let m = 0; m < 12; m++) {
    const days = monthDays[m].size;
    if (days === 0) continue;
    const min = VEGETATION_MONTHS.includes(m)
      ? RAUS_VEGETATION_MIN_DAYS
      : RAUS_WINTER_MIN_DAYS;
    if (days < min) {
      const monthName = new Date(year, m, 1).toLocaleString("default", {
        month: "long",
      });
      items.push({ label: monthName, detail: `${days} / ${min} Tage` });
    }
  }

  return {
    id: "rausCoverage",
    domain: "animal",
    status: items.length > 0 ? "warn" : "info",
    failingCount: items.length,
    items,
  };
}
