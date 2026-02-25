import { useMemo } from "react";
import { RecurrenceRule } from "../plan-crop-rotations.store";

export type DateRange = {
  from: Date;
  to: Date;
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function useExpandRecurrence(
  fromDate: Date,
  toDate: Date,
  recurrence?: RecurrenceRule,
  windowDays: number = 365
): DateRange[] {
  return useMemo(() => {
    if (!recurrence || !recurrence.until) {
      return [{ from: fromDate, to: toDate }];
    }

    const ranges: DateRange[] = [];
    const windowEnd = addDays(fromDate, windowDays);
    const maxDate = recurrence.until < windowEnd ? recurrence.until : windowEnd;

    let currentFrom = new Date(fromDate);
    let currentTo = new Date(toDate);

    while (currentFrom <= maxDate) {
      ranges.push({ from: new Date(currentFrom), to: new Date(currentTo) });
      currentFrom = addYears(currentFrom, recurrence.interval);
      currentTo = addYears(currentTo, recurrence.interval);
      if (currentFrom > maxDate) break;
    }

    return ranges;
  }, [fromDate, toDate, recurrence, windowDays]);
}

export function hasOverlap(rangesA: DateRange[], rangesB: DateRange[]): boolean {
  for (const rangeA of rangesA) {
    for (const rangeB of rangesB) {
      if (rangeA.from <= rangeB.to && rangeA.to >= rangeB.from) {
        return true;
      }
    }
  }
  return false;
}
