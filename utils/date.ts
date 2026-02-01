export const INFINITE_DATE = new Date(5000, 0, 1);

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

/** Converts a Date to a "YYYY-MM-DD" string using local timezone (not UTC). */
export function dateToDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Parses a "YYYY-MM-DD" string into a local Date. */
export function dateStringToDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getYearRange(year: number) {
  const from = new Date(year, 0, 1, 0, 0, 0, 0); // January 1st, 00:00:00
  const to = new Date(year, 11, 31, 23, 59, 59, 999); // December 31st, 23:59:59.999
  return { from, to };
}
