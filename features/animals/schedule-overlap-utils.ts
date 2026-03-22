import { OutdoorScheduleCreateInput } from "@/api/herds.api";

const MS_PER_DAY = 86_400_000;

/**
 * Check if any pair of outdoor schedules overlap, accounting for recurrence.
 * Reuses the same approach as PlanCropRotationsScreen conflict detection.
 */
export function hasScheduleOverlaps(
  schedules: OutdoorScheduleCreateInput[],
): boolean {
  if (schedules.length < 2) return false;

  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date.getTime() - start.getTime()) / MS_PER_DAY);
  };

  // Check if two day-of-year ranges overlap (for recurring schedules).
  // A range that spans a year boundary (e.g. Nov–Mar) is split into two
  // sub-ranges so we don't false-positive against non-overlapping ranges.
  const dayRangesOverlap = (
    aFromDay: number,
    aToDay: number,
    bFromDay: number,
    bToDay: number,
  ) => {
    const aRanges: Array<[number, number]> =
      aFromDay <= aToDay ? [[aFromDay, aToDay]] : [[aFromDay, 366], [1, aToDay]];
    const bRanges: Array<[number, number]> =
      bFromDay <= bToDay ? [[bFromDay, bToDay]] : [[bFromDay, 366], [1, bToDay]];
    return aRanges.some(([aF, aT]) => bRanges.some(([bF, bT]) => aF <= bT && aT >= bF));
  };

  // Get all years a schedule occupies. yearSpan = endYear - startYear of one occurrence
  // (usually 0, but 1 for a Nov–Mar span). Each occurrence at year N covers N..N+yearSpan.
  const getOccurrenceYears = (
    startYear: number,
    interval: number,
    untilYear: number | null,
    rangeStart: number,
    rangeEnd: number,
    yearSpan: number,
  ): Set<number> => {
    const years = new Set<number>();
    const effectiveEnd = untilYear ? Math.min(untilYear, rangeEnd) : rangeEnd;
    for (let year = startYear; year <= effectiveEnd; year += interval) {
      for (let span = 0; span <= yearSpan; span++) {
        if (year + span >= rangeStart) years.add(year + span);
      }
    }
    return years;
  };

  const shareCommonYear = (
    a: OutdoorScheduleCreateInput,
    b: OutdoorScheduleCreateInput,
  ): boolean => {
    const rangeStart = new Date().getFullYear() - 10;
    const rangeEnd = new Date().getFullYear() + 25;

    const aStart = new Date(a.startDate);
    const aEnd = a.endDate ? new Date(a.endDate) : aStart;
    const bStart = new Date(b.startDate);
    const bEnd = b.endDate ? new Date(b.endDate) : bStart;
    const aStartYear = aStart.getFullYear();
    const aEndYear = aEnd.getFullYear();
    const bStartYear = bStart.getFullYear();
    const bEndYear = bEnd.getFullYear();
    const aYearSpan = aEndYear - aStartYear;
    const bYearSpan = bEndYear - bStartYear;
    const aInterval = a.recurrence?.interval ?? 1;
    const bInterval = b.recurrence?.interval ?? 1;
    const aUntilYear = a.recurrence?.until
      ? new Date(a.recurrence.until).getFullYear()
      : null;
    const bUntilYear = b.recurrence?.until
      ? new Date(b.recurrence.until).getFullYear()
      : null;

    if (!a.recurrence && !b.recurrence) {
      // Neither recurs: check if their year ranges overlap
      return aStartYear <= bEndYear && aEndYear >= bStartYear;
    }

    const aYears = a.recurrence
      ? getOccurrenceYears(aStartYear, aInterval, aUntilYear, rangeStart, rangeEnd, aYearSpan)
      : new Set(Array.from({ length: aYearSpan + 1 }, (_, i) => aStartYear + i));
    const bYears = b.recurrence
      ? getOccurrenceYears(bStartYear, bInterval, bUntilYear, rangeStart, rangeEnd, bYearSpan)
      : new Set(Array.from({ length: bYearSpan + 1 }, (_, i) => bStartYear + i));

    for (const year of aYears) {
      if (bYears.has(year)) return true;
    }
    return false;
  };

  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const a = schedules[i];
      const b = schedules[j];
      const aStart = new Date(a.startDate);
      const bStart = new Date(b.startDate);
      const aEnd = a.endDate ? new Date(a.endDate) : aStart;
      const bEnd = b.endDate ? new Date(b.endDate) : bStart;

      if (a.recurrence || b.recurrence) {
        // Recurring: check day-of-year overlap AND shared occurrence year
        const aFromDay = getDayOfYear(aStart);
        const aToDay = getDayOfYear(aEnd);
        const bFromDay = getDayOfYear(bStart);
        const bToDay = getDayOfYear(bEnd);

        if (dayRangesOverlap(aFromDay, aToDay, bFromDay, bToDay) && shareCommonYear(a, b)) {
          return true;
        }
      } else {
        // Non-recurring: check actual date overlap
        if (aStart <= bEnd && aEnd >= bStart) return true;
      }
    }
  }

  return false;
}
