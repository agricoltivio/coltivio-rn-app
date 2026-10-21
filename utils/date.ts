export const INFINITE_DATE = new Date("4999-12-31T00:00:00Z");

export function isInfiniteDate(date: Date) {
  return date.getTime() >= INFINITE_DATE.getTime();
}

export function getMinMaxIso(dates: string[]) {
  if (!dates.length) return null;

  let min = dates[0];
  let max = dates[0];

  for (const d of dates) {
    if (d < min) min = d;
    if (d > max) max = d;
  }

  return { min, max };
}

export function formatLocalizedDate(
  date: Date,
  locale: string,
  type: "long" | "numeric" = "numeric",
  showYear: boolean = true,
) {
  return new Intl.DateTimeFormat(locale, {
    year: showYear ? "numeric" : undefined,
    month: type,
    day: "numeric",
  }).format(date);
}

export function formatLocalizedDateTime(
  date: Date,
  locale: string,
  type: "long" | "numeric" = "long",
  showYear: boolean = true,
) {
  return new Intl.DateTimeFormat(locale, {
    year: showYear ? "numeric" : undefined,
    month: type,
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
}

export function getYearRange(year: number) {
  const from = new Date(year, 0, 1, 0, 0, 0, 0); // January 1st, 00:00:00
  const to = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st, 23:59:59.999
  return { from, to };
}

// Combines a date (for year/month/day) with a time (for hours/minutes)
export function combineDateAndTime(date: Date, time: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
    0,
  );
}

// Local calendar date as "YYYY-MM-DD", for date-only API fields. toISOString() would
// shift dates picked around local midnight onto the previous day in UTC.
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Local midnight of a date-only API value ("2025-05-16" or "2025-05-16T00:00:00.000Z").
// new Date() would read it as UTC midnight, the previous day west of UTC.
export function parseDateOnly(isoDate: string): Date {
  const [year, month, day] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}
