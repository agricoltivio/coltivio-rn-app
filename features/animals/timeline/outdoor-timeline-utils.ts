import { OutdoorSchedule } from "@/api/herds.api";
import { addWeeks, addMonths, addYears, setDay, getDay } from "date-fns";

export type OutdoorBar = {
  scheduleId: string;
  herdName: string;
  herdId: string;
  startDay: number; // days since epochStart
  endDay: number; // days since epochStart
  isOpenEnded: boolean;
  notes: string | null;
  scheduleType?: "pasture" | "exercise_yard";
  // Journal-specific metadata
  animalCount?: number;
  startDate?: string;
  endDate?: string;
};

export type OutdoorHerdData = {
  herdId: string;
  herdName: string;
  bars: OutdoorBar[];
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
  type?: "pasture" | "exercise_yard";
  recurrence: {
    frequency: "weekly" | "monthly" | "yearly";
    interval: number;
    byWeekday: string[] | null;
    byMonthDay: number | null;
    until: string | null;
    count: number | null;
  } | null;
};

// Builds timeline data from one or more herds' outdoor schedules.
// Epoch: current year +/- 3 years (6-year window).
// Recurring schedules are expanded into individual bars.
export function buildOutdoorTimelineData(
  herds: { herdId: string; herdName: string; schedules: ScheduleInput[] }[],
): OutdoorTimelineData {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 3;
  const endYear = currentYear + 3;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  const epochStart = new Date(startYear, 0, 1);
  const epochEnd = new Date(endYear, 11, 31, 23, 59, 59, 999);
  const totalDays = daysBetween(epochStart, epochEnd) + 1;

  const herdRows: OutdoorHerdData[] = herds.map(
    ({ herdId, herdName, schedules }) => {
      const bars: OutdoorBar[] = [];

      for (const schedule of schedules) {
        const occurrences = expandSchedule(schedule, epochStart, epochEnd);
        for (const occ of occurrences) {
          bars.push({
            scheduleId: schedule.id,
            herdName,
            herdId,
            startDay: occ.startDay,
            endDay: occ.endDay,
            isOpenEnded: occ.isOpenEnded,
            notes: schedule.notes,
            scheduleType: schedule.type,
          });
        }
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

  while (current.getTime() <= limit && occurrenceCount < 500) {
    if (count !== null && occurrenceCount >= count) break;

    if (frequency === "weekly" && byWeekday && byWeekday.length > 0) {
      // Emit one occurrence per specified weekday within this week iteration
      for (const wd of byWeekday) {
        if (count !== null && occurrenceCount >= count) break;
        const occStart = setDay(current, WEEKDAY_INDEX[wd], {
          weekStartsOn: getDay(current) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        });
        if (occStart < baseStart) continue;
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
    } else {
      let occStart = current;
      if (frequency === "monthly" && byMonthDay !== null) {
        occStart = new Date(occStart);
        occStart.setDate(byMonthDay);
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

  return results;
}
