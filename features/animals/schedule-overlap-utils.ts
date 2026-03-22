import { OutdoorScheduleCreateInput } from "@/api/herds.api";
import { addWeeks, addMonths, addYears } from "date-fns";

// Expand one schedule into its concrete date occurrences up to rangeEnd.
function expandOccurrences(
  schedule: OutdoorScheduleCreateInput,
  rangeEnd: Date,
): Array<{ from: Date; to: Date }> {
  const from = new Date(schedule.startDate);
  const to = schedule.endDate ? new Date(schedule.endDate) : new Date(from);

  if (!schedule.recurrence) {
    return [{ from, to }];
  }

  const { frequency, interval, until } = schedule.recurrence;
  const effectiveUntil =
    until && new Date(until) < rangeEnd ? new Date(until) : rangeEnd;

  const durationMs = to.getTime() - from.getTime();
  const ranges: Array<{ from: Date; to: Date }> = [];
  let current = new Date(from);

  while (current <= effectiveUntil) {
    ranges.push({ from: new Date(current), to: new Date(current.getTime() + durationMs) });
    if (frequency === "weekly") current = addWeeks(current, interval);
    else if (frequency === "monthly") current = addMonths(current, interval);
    else current = addYears(current, interval);
  }

  return ranges;
}

/**
 * Check if any pair of outdoor schedules overlap, accounting for recurrence
 * across all frequencies (weekly, monthly, yearly) by fully expanding occurrences.
 */
export function hasScheduleOverlaps(
  schedules: OutdoorScheduleCreateInput[],
): boolean {
  if (schedules.length < 2) return false;

  // Derive range end from the latest until date across all schedules,
  // falling back to 25 years from now so open-ended recurrences are bounded.
  const defaultEnd = new Date(new Date().getFullYear() + 25, 11, 31);
  const rangeEnd = schedules.reduce((max, s) => {
    if (!s.recurrence?.until) return max;
    const until = new Date(s.recurrence.until);
    return until > max ? until : max;
  }, defaultEnd);

  const expanded = schedules.map((s) => expandOccurrences(s, rangeEnd));

  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      for (const a of expanded[i]) {
        for (const b of expanded[j]) {
          if (a.from <= b.to && a.to >= b.from) return true;
        }
      }
    }
  }

  return false;
}
