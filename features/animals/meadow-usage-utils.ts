import { MeadowUsageEntry } from "@/api/meadows.api";

const MS_PER_DAY = 86_400_000;

// Default range for meadow usage and the outdoor journal: up to 10 years back until
// 3 years ahead (date-only, as the API expects). Timelines start at the year of the
// earliest returned entry.
const currentYear = new Date().getFullYear();
export const OUTDOOR_HISTORY_FROM_DATE = `${currentYear - 10}-01-01`;
export const OUTDOOR_HISTORY_TO_DATE = `${currentYear + 3}-12-31`;

export type MeadowMonthlyUsage = {
  // Distinct days with any herd on the meadow, per month (index 0 = January)
  occupiedDays: number[];
  // Animal-days per animal type per month: days on the meadow × animals of that type
  animalDaysByType: Record<string, number[]>;
};

// Day number from the date part only ("2025-05-16…"), so the calendar day the
// backend means is used regardless of the device timezone
function toDayNumber(isoDate: string): number {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function monthOfDayNumber(dayNumber: number): number {
  return new Date(dayNumber * MS_PER_DAY).getUTCMonth();
}

// Monthly usage of a meadow in one year. Stays count inclusive on both ends; days
// after `untilDate` (usually today) are left out, so planned stays don't count yet.
export function computeMeadowMonthlyUsage(
  entries: MeadowUsageEntry[],
  year: number,
  untilDate: Date,
): MeadowMonthlyUsage {
  const yearStart = Date.UTC(year, 0, 1) / MS_PER_DAY;
  const yearEnd = Date.UTC(year, 11, 31) / MS_PER_DAY;
  const lastCountedDay = Math.min(
    yearEnd,
    Date.UTC(
      untilDate.getFullYear(),
      untilDate.getMonth(),
      untilDate.getDate(),
    ) / MS_PER_DAY,
  );

  const occupiedDaySet = new Set<number>();
  const animalDaysByType: Record<string, number[]> = {};

  for (const entry of entries) {
    const firstDay = Math.max(toDayNumber(entry.startDate), yearStart);
    const lastDay = Math.min(toDayNumber(entry.endDate), lastCountedDay);
    for (let day = firstDay; day <= lastDay; day++) {
      const month = monthOfDayNumber(day);
      occupiedDaySet.add(day);
      for (const [animalType, count] of Object.entries(
        entry.animalCountsByType,
      )) {
        const perMonth = (animalDaysByType[animalType] ??= new Array(12).fill(
          0,
        ));
        perMonth[month] += count;
      }
    }
  }

  const occupiedDays = new Array(12).fill(0);
  for (const day of occupiedDaySet) {
    occupiedDays[monthOfDayNumber(day)] += 1;
  }

  return {
    occupiedDays,
    animalDaysByType,
  };
}

// Years from the first stay up to the current year, newest first
export function getMeadowUsageYears(
  entries: MeadowUsageEntry[],
  currentYear: number,
): number[] {
  const firstYear = entries.reduce(
    (earliest, entry) =>
      Math.min(earliest, Number(entry.startDate.slice(0, 4))),
    currentYear,
  );
  return Array.from(
    { length: currentYear - firstYear + 1 },
    (_, index) => currentYear - index,
  );
}

type ScheduleEndInfo = {
  meadowId: string | null;
  endDate: string | null;
  recurrence: { until: string | null } | null;
};

// Names of the herds with a schedule on this meadow that hasn't ended yet (ongoing or
// upcoming). A repeating schedule ends with its "until" date, a single stay with its
// end date; without one it's open-ended. today is a "YYYY-MM-DD" local date.
// Such a meadow can't be archived.
export function getHerdsWithActiveSchedules(
  herds: { name: string; outdoorSchedules: ScheduleEndInfo[] }[],
  meadowId: string,
  today: string,
): string[] {
  return herds
    .filter((herd) =>
      herd.outdoorSchedules.some((schedule) => {
        if (schedule.meadowId !== meadowId) return false;
        const lastDay = schedule.recurrence
          ? schedule.recurrence.until
          : schedule.endDate;
        return lastDay === null || lastDay.slice(0, 10) >= today;
      }),
    )
    .map((herd) => herd.name);
}
