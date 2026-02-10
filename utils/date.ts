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
