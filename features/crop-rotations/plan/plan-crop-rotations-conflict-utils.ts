import type { RotationEntry } from "./plan-crop-rotations.store";

const MS_PER_DAY = 86_400_000;

// Day-of-year: Jan 1 = 1, Dec 31 = 365/366
export function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / MS_PER_DAY);
}

// Check if two day-of-year ranges overlap.
// Ranges spanning a year boundary (e.g. Nov–Mar) are split into two sub-ranges
// to avoid false positives against non-overlapping ranges.
export function dayRangesOverlap(
  aFromDay: number,
  aToDay: number,
  bFromDay: number,
  bToDay: number,
): boolean {
  const aRanges: [number, number][] =
    aFromDay <= aToDay ? [[aFromDay, aToDay]] : [[aFromDay, 366], [1, aToDay]];
  const bRanges: [number, number][] =
    bFromDay <= bToDay ? [[bFromDay, bToDay]] : [[bFromDay, 366], [1, bToDay]];
  return aRanges.some(([af, at]) => bRanges.some(([bf, bt]) => af <= bt && at >= bf));
}

// Returns all years (within rangeStart..rangeEnd) that a recurring rotation occupies.
// yearSpan accounts for occurrences that cross a year boundary (endYear - startYear of one occurrence).
export function getOccurrenceYears(
  startYear: number,
  interval: number,
  untilYear: number | null,
  rangeStart: number,
  rangeEnd: number,
  yearSpan: number,
): Set<number> {
  const years = new Set<number>();
  const effectiveEnd = untilYear ? Math.min(untilYear, rangeEnd) : rangeEnd;
  for (let year = startYear; year <= effectiveEnd; year += interval) {
    for (let span = 0; span <= yearSpan; span++) {
      if (year + span >= rangeStart) years.add(year + span);
    }
  }
  return years;
}

// Returns true if two rotation entries overlap in time.
// For recurring rotations: both must share a common occurrence year AND have
// overlapping day-of-year windows.
// For non-recurring: checks actual date range overlap.
export function hasRotationOverlap(
  a: RotationEntry,
  b: RotationEntry,
  rangeStart: number,
  rangeEnd: number,
): boolean {
  if (!a.recurrence && !b.recurrence) {
    return a.fromDate <= b.toDate && a.toDate >= b.fromDate;
  }

  // At least one is recurring: check day-of-year overlap first (cheap)
  if (!dayRangesOverlap(
    getDayOfYear(a.fromDate), getDayOfYear(a.toDate),
    getDayOfYear(b.fromDate), getDayOfYear(b.toDate),
  )) return false;

  // Then check that the two entries share at least one common year
  const aStartYear = a.fromDate.getFullYear();
  const aEndYear = a.toDate.getFullYear();
  const bStartYear = b.fromDate.getFullYear();
  const bEndYear = b.toDate.getFullYear();

  const aYears = a.recurrence
    ? getOccurrenceYears(
        aStartYear, a.recurrence.interval,
        a.recurrence.until?.getFullYear() ?? null,
        rangeStart, rangeEnd, aEndYear - aStartYear,
      )
    : new Set(Array.from({ length: aEndYear - aStartYear + 1 }, (_, i) => aStartYear + i));

  const bYears = b.recurrence
    ? getOccurrenceYears(
        bStartYear, b.recurrence.interval,
        b.recurrence.until?.getFullYear() ?? null,
        rangeStart, rangeEnd, bEndYear - bStartYear,
      )
    : new Set(Array.from({ length: bEndYear - bStartYear + 1 }, (_, i) => bStartYear + i));

  for (const year of aYears) {
    if (bYears.has(year)) return true;
  }
  return false;
}
