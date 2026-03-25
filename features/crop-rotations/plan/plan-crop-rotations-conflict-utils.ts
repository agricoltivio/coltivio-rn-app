import { addYears } from "date-fns";
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
    aFromDay <= aToDay
      ? [[aFromDay, aToDay]]
      : [
          [aFromDay, 366],
          [1, aToDay],
        ];
  const bRanges: [number, number][] =
    bFromDay <= bToDay
      ? [[bFromDay, bToDay]]
      : [
          [bFromDay, 366],
          [1, bToDay],
        ];
  return aRanges.some(([af, at]) =>
    bRanges.some(([bf, bt]) => af <= bt && at >= bf),
  );
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

// Expand a rotation into concrete {from, to} date pairs within the given year range.
// For recurring rotations, generates each occurrence until `until` or rangeEnd.
function getOccurrences(
  rotation: RotationEntry,
  rangeStartYear: number,
  rangeEndYear: number,
): { from: Date; to: Date }[] {
  if (!rotation.recurrence) {
    return [{ from: rotation.fromDate, to: rotation.toDate }];
  }

  const rangeStart = new Date(rangeStartYear, 0, 1);
  const rangeEnd = new Date(rangeEndYear, 11, 31, 23, 59, 59, 999);
  const durationMs = rotation.toDate.getTime() - rotation.fromDate.getTime();
  const untilTime = rotation.recurrence.until
    ? Math.min(rotation.recurrence.until.getTime(), rangeEnd.getTime())
    : rangeEnd.getTime();

  const occurrences: { from: Date; to: Date }[] = [];
  let currentFrom = new Date(rotation.fromDate);

  while (currentFrom.getTime() <= untilTime) {
    const currentTo = new Date(currentFrom.getTime() + durationMs);
    if (currentTo >= rangeStart) {
      occurrences.push({ from: new Date(currentFrom), to: currentTo });
    }
    currentFrom = addYears(currentFrom, rotation.recurrence.interval);
  }

  return occurrences;
}

// Returns true if two rotation entries overlap in actual calendar time.
// Expands recurrences to concrete occurrences and compares timestamps directly,
// avoiding the false-positive produced by day-of-year arithmetic on year-spanning ranges.
export function hasRotationOverlap(
  a: RotationEntry,
  b: RotationEntry,
  rangeStart: number,
  rangeEnd: number,
): boolean {
  const aOccurrences = getOccurrences(a, rangeStart, rangeEnd);
  const bOccurrences = getOccurrences(b, rangeStart, rangeEnd);
  return aOccurrences.some((ao) =>
    bOccurrences.some((bo) => ao.from <= bo.to && ao.to >= bo.from),
  );
}
