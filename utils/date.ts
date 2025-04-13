export function formatLocalizedDate(
  date: Date,
  locale: string,
  type: "long" | "numeric" = "numeric",
  showYear: boolean = true
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
  showYear: boolean = true
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
