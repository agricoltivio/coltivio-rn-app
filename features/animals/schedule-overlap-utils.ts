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

  // Check if two day-of-year ranges overlap (for recurring schedules)
  const dayRangesOverlap = (
    aFromDay: number,
    aToDay: number,
    bFromDay: number,
    bToDay: number,
  ) => {
    if (aFromDay <= aToDay && bFromDay <= bToDay) {
      return aFromDay <= bToDay && aToDay >= bFromDay;
    }
    // If either range wraps around year boundary, treat as overlapping
    return true;
  };

  // Get all years a schedule occurs in
  const getOccurrenceYears = (
    startYear: number,
    interval: number,
    untilYear: number | null,
    rangeStart: number,
    rangeEnd: number,
  ): Set<number> => {
    const years = new Set<number>();
    const effectiveEnd = untilYear ? Math.min(untilYear, rangeEnd) : rangeEnd;
    for (let year = startYear; year <= effectiveEnd; year += interval) {
      if (year >= rangeStart) years.add(year);
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
    const bStart = new Date(b.startDate);
    const aInterval = a.recurrence?.interval ?? 1;
    const bInterval = b.recurrence?.interval ?? 1;
    const aUntilYear = a.recurrence?.until
      ? new Date(a.recurrence.until).getFullYear()
      : null;
    const bUntilYear = b.recurrence?.until
      ? new Date(b.recurrence.until).getFullYear()
      : null;

    if (!a.recurrence && !b.recurrence) {
      return aStart.getFullYear() === bStart.getFullYear();
    }

    const aYears = a.recurrence
      ? getOccurrenceYears(aStart.getFullYear(), aInterval, aUntilYear, rangeStart, rangeEnd)
      : new Set([aStart.getFullYear()]);
    const bYears = b.recurrence
      ? getOccurrenceYears(bStart.getFullYear(), bInterval, bUntilYear, rangeStart, rangeEnd)
      : new Set([bStart.getFullYear()]);

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
