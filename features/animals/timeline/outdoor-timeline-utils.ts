import { OutdoorSchedule, OutdoorScheduleType } from "@/api/herds.api";
import { parseDateOnly } from "@/utils/date";
import {
  addWeeks,
  addMonths,
  addYears,
  differenceInCalendarDays,
  getDaysInMonth,
  setDay,
  getDay,
} from "date-fns";

export type OutdoorBar = {
  scheduleId: string;
  herdName: string;
  herdId: string;
  startDay: number; // days since epochStart
  endDay: number; // days since epochStart
  isOpenEnded: boolean;
  isFuture: boolean; // starts after today — rendered as projection
  notes: string | null;
  scheduleType?: OutdoorScheduleType;
  // The bar is an override (scheduleId is then the override's id), drawn on top of the schedules
  isOverride?: boolean;
  // Journal-specific metadata
  animalCount?: number;
  meadowName?: string;
  meadowSize?: number;
  // Sub-line within the row when bars overlap (0 = top); see OutdoorHerdData.laneCount
  lane?: number;
  startDate?: string;
  endDate?: string;
};

export type OutdoorHerdData = {
  herdId: string;
  herdName: string;
  bars: OutdoorBar[];
  // Number of sub-lines the row is split into; 1 when omitted
  laneCount?: number;
};

export type OutdoorTimelineData = {
  herds: OutdoorHerdData[];
  epochStart: Date;
  totalDays: number;
  years: number[];
};

const MS_PER_DAY = 86_400_000;

const WEEKDAY_INDEX: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY);
}

type ScheduleInput = {
  id: string;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  type?: OutdoorScheduleType;
  recurrence: {
    frequency: "weekly" | "monthly" | "yearly";
    interval: number;
    byWeekday: string[] | null;
    byMonthDay: number | null;
    until: string | null;
    count: number | null;
  } | null;
};

// Timeline range: from 3 years back — or further, to the year of the earliest
// entry — until 3 years ahead
export function getTimelineEpoch(entryStartDates: string[]) {
  const currentYear = new Date().getFullYear();
  const earliestEntryYear = entryStartDates.reduce(
    (earliest, startDate) =>
      Math.min(earliest, new Date(startDate).getFullYear()),
    Infinity,
  );
  const startYear = Math.min(currentYear - 3, earliestEntryYear);
  const endYear = currentYear + 3;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );
  const epochStart = new Date(startYear, 0, 1);
  const epochEnd = new Date(endYear, 11, 31, 23, 59, 59, 999);
  const totalDays = daysBetween(epochStart, epochEnd) + 1;
  const todayDay = daysBetween(epochStart, new Date());
  return { years, epochStart, epochEnd, totalDays, todayDay };
}

type OverrideInput = {
  id: string;
  startDate: string;
  // inclusive
  endDate: string;
  type: OutdoorScheduleType;
  notes: string | null;
};

// Parts of [startDay, endDay] not covered by the given day ranges (all inclusive)
export function subtractDayRanges(
  startDay: number,
  endDay: number,
  covered: { startDay: number; endDay: number }[],
): { startDay: number; endDay: number }[] {
  const parts: { startDay: number; endDay: number }[] = [];
  let cursor = startDay;
  for (const range of [...covered].sort((a, b) => a.startDay - b.startDay)) {
    if (range.endDay < cursor || range.startDay > endDay) continue;
    if (range.startDay > cursor) {
      parts.push({ startDay: cursor, endDay: range.startDay - 1 });
    }
    cursor = Math.max(cursor, range.endDay + 1);
  }
  if (cursor <= endDay) parts.push({ startDay: cursor, endDay });
  return parts;
}

// Builds timeline data from one or more herds' outdoor schedules.
// Recurring schedules are expanded into individual bars. Overrides take precedence over
// the schedules on their days, as on the server: their days are cut out of the schedule
// bars and they get bars of their own.
export function buildOutdoorTimelineData(
  herds: {
    herdId: string;
    herdName: string;
    schedules: ScheduleInput[];
    // Drawn in this row and cut out of its schedules
    overrides?: OverrideInput[];
    // Only cut out of this row's schedules, drawn elsewhere (e.g. a stable override in
    // the meadow view, whose row is "no meadow")
    otherOverrides?: OverrideInput[];
  }[],
): OutdoorTimelineData {
  const { years, epochStart, epochEnd, totalDays, todayDay } = getTimelineEpoch(
    herds.flatMap((herd) => [
      ...herd.schedules.map((s) => s.startDate),
      ...(herd.overrides ?? []).map((override) => override.startDate),
    ]),
  );
  const lastDay = daysBetween(epochStart, epochEnd);

  const herdRows: OutdoorHerdData[] = herds.map(
    ({ herdId, herdName, schedules, overrides = [], otherOverrides = [] }) => {
      const bars: OutdoorBar[] = [];

      const toOverrideDays = (rowOverrides: OverrideInput[]) =>
        rowOverrides
          .map((override) => ({
            override,
            startDay: Math.max(
              0,
              differenceInCalendarDays(
                parseDateOnly(override.startDate),
                epochStart,
              ),
            ),
            endDay: Math.min(
              lastDay,
              differenceInCalendarDays(
                parseDateOnly(override.endDate),
                epochStart,
              ),
            ),
          }))
          .filter((range) => range.startDay <= range.endDay);
      const overrideDays = toOverrideDays(overrides);
      const cuttingDays = [...overrideDays, ...toOverrideDays(otherOverrides)];

      for (const schedule of schedules) {
        const occurrences = expandSchedule(schedule, epochStart, epochEnd);
        for (const occ of occurrences) {
          for (const part of subtractDayRanges(
            occ.startDay,
            occ.endDay,
            cuttingDays,
          )) {
            bars.push({
              scheduleId: schedule.id,
              herdName,
              herdId,
              startDay: part.startDay,
              endDay: part.endDay,
              // Only the part reaching the original end keeps the open end
              isOpenEnded: occ.isOpenEnded && part.endDay === occ.endDay,
              isFuture: part.startDay > todayDay,
              notes: schedule.notes,
              scheduleType: schedule.type,
            });
          }
        }
      }

      for (const { override, startDay, endDay } of overrideDays) {
        bars.push({
          scheduleId: override.id,
          herdName,
          herdId,
          startDay,
          endDay,
          isOpenEnded: false,
          isFuture: startDay > todayDay,
          notes: override.notes,
          scheduleType: override.type,
          isOverride: true,
        });
      }

      bars.sort((a, b) => a.startDay - b.startDay);
      return { herdId, herdName, bars };
    },
  );

  return { herds: herdRows, epochStart, totalDays, years };
}

// Convenience for a single herd (HerdEditScreen)
export function buildSingleHerdTimelineData(
  herdId: string,
  herdName: string,
  schedules: OutdoorSchedule[],
): OutdoorTimelineData {
  return buildOutdoorTimelineData([
    {
      herdId,
      herdName,
      schedules: schedules.map((s) => ({
        id: s.id,
        startDate: s.startDate,
        endDate: s.endDate,
        notes: s.notes,
        type: s.type,
        recurrence: s.recurrence
          ? {
              frequency: s.recurrence.frequency,
              interval: s.recurrence.interval,
              byWeekday: s.recurrence.byWeekday ?? null,
              byMonthDay: s.recurrence.byMonthDay ?? null,
              until: s.recurrence.until,
              count: s.recurrence.count ?? null,
            }
          : null,
      })),
    },
  ]);
}

type OccurrenceResult = {
  startDay: number;
  endDay: number;
  isOpenEnded: boolean;
};

// Expands a schedule (potentially recurring) into concrete bar occurrences.
function expandSchedule(
  schedule: ScheduleInput,
  epochStart: Date,
  epochEnd: Date,
): OccurrenceResult[] {
  const baseStart = new Date(schedule.startDate);
  const baseEnd = schedule.endDate ? new Date(schedule.endDate) : null;
  const isOpenEnded = !baseEnd;
  // Duration of a single occurrence in ms (0 for open-ended, use 1 day minimum)
  const durationMs = baseEnd
    ? baseEnd.getTime() - baseStart.getTime()
    : MS_PER_DAY;

  if (!schedule.recurrence) {
    // Single occurrence
    const occEnd = baseEnd ?? epochEnd;
    const clampedStart = baseStart < epochStart ? epochStart : baseStart;
    const clampedEnd = occEnd > epochEnd ? epochEnd : occEnd;
    if (clampedStart > epochEnd || clampedEnd < epochStart) return [];
    return [
      {
        startDay: daysBetween(epochStart, clampedStart),
        endDay: daysBetween(epochStart, clampedEnd),
        isOpenEnded,
      },
    ];
  }

  // Recurring: expand using interval and frequency
  const { frequency, interval, until, count, byWeekday, byMonthDay } =
    schedule.recurrence;
  const untilDate = until ? new Date(until) : epochEnd;
  const limit = Math.min(untilDate.getTime(), epochEnd.getTime());
  const results: OccurrenceResult[] = [];
  let current = new Date(baseStart);
  let occurrenceCount = 0;
  // Safety stop per week/month/year step, not per occurrence: a weekly stay on
  // all seven weekdays would otherwise stop after ~70 weeks, well before the
  // timeline ends. 1000 steps cover the whole range even for weekly schedules.
  let iterationCount = 0;

  // A monthly byMonthDay moves each occurrence away from the month cursor, so the end is decided on the
  // occurrence itself below (as on the server): start Jan 15 with day 31 until Jun 20 has no Jun 30,
  // start Jan 20 with day 5 until Jun 10 still has Jun 5.
  const occurrenceDayShifted = frequency === "monthly" && byMonthDay !== null;
  while (iterationCount < 1000) {
    if (!occurrenceDayShifted && current.getTime() > limit) break;
    iterationCount++;
    if (count !== null && occurrenceCount >= count) break;

    if (frequency === "weekly" && byWeekday && byWeekday.length > 0) {
      // Emit one occurrence per specified weekday within this week iteration
      for (const wd of byWeekday) {
        if (count !== null && occurrenceCount >= count) break;
        const occStart = setDay(current, WEEKDAY_INDEX[wd], {
          weekStartsOn: getDay(current) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        });
        if (occStart < baseStart || occStart.getTime() > limit) {
          occurrenceCount++;
          continue;
        }
        if (occStart >= epochStart && occStart <= epochEnd) {
          // Each weekday is a whole day on pasture. Calendar days keep consecutive
          // days adjacent across daylight-saving changes.
          const startDay = differenceInCalendarDays(occStart, epochStart);
          const occEndDay =
            differenceInCalendarDays(
              new Date(occStart.getTime() + durationMs),
              epochStart,
            ) + 1;
          results.push({
            startDay,
            endDay: Math.min(occEndDay, daysBetween(epochStart, epochEnd)),
            isOpenEnded: false,
          });
        }
        occurrenceCount++;
      }
    } else {
      let occStart = current;
      if (frequency === "monthly" && byMonthDay !== null) {
        occStart = new Date(occStart);
        // Months without that day (31 in April) fall back to their last day
        // instead of spilling into the next month.
        occStart.setDate(Math.min(byMonthDay, getDaysInMonth(occStart)));
        if (occStart.getTime() > limit) break;
      }
      const occEnd = new Date(occStart.getTime() + durationMs);
      const clampedStart = occStart < epochStart ? epochStart : occStart;
      const clampedEnd = occEnd > epochEnd ? epochEnd : occEnd;
      if (clampedEnd >= epochStart && clampedStart <= epochEnd) {
        results.push({
          startDay: daysBetween(epochStart, clampedStart),
          endDay: daysBetween(epochStart, clampedEnd),
          isOpenEnded: false,
        });
      }
      occurrenceCount++;
    }

    // Advance to the next week/month/year iteration
    switch (frequency) {
      case "weekly":
        current = addWeeks(
          baseStart,
          Math.floor(occurrenceCount / (byWeekday?.length ?? 1)) * interval,
        );
        break;
      case "monthly":
        current = addMonths(baseStart, occurrenceCount * interval);
        break;
      case "yearly":
        current = addYears(baseStart, occurrenceCount * interval);
        break;
    }
  }

  // Weekday stays: merge consecutive days into one continuous bar
  if (frequency === "weekly" && byWeekday && byWeekday.length > 0) {
    const merged: OccurrenceResult[] = [];
    for (const occurrence of results.sort((a, b) => a.startDay - b.startDay)) {
      const previous = merged[merged.length - 1];
      if (previous && occurrence.startDay <= previous.endDay) {
        previous.endDay = Math.max(previous.endDay, occurrence.endDay);
      } else {
        merged.push({ ...occurrence });
      }
    }
    return merged;
  }

  return results;
}
