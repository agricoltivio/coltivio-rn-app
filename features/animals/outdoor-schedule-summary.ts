import { OutdoorScheduleCreateInput } from "@/api/herds.api";
import { formatLocalizedDate, parseDateOnly } from "@/utils/date";
import { TFunction } from "i18next";

const WEEKDAY_ORDER = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

type ScheduleRecurrence = NonNullable<OutdoorScheduleCreateInput["recurrence"]>;

// Fits both saved schedules and the ones still being edited on the herd screens
type ScheduleForSummary = {
  type: OutdoorScheduleCreateInput["type"];
  startDate: string;
  endDate?: string | null;
  recurrence?: {
    frequency: ScheduleRecurrence["frequency"];
    byWeekday?: string[] | null;
    until?: string | null;
  } | null;
};

// One line per schedule, e.g. "Weide: 01.05.2025 - 30.09.2025 · Hauswiese (Wöchentlich: Mo, Di)".
// meadowName is left out when not given.
export function formatOutdoorScheduleSummary(
  schedule: ScheduleForSummary,
  t: TFunction,
  locale: string,
  meadowName?: string,
): string {
  const typeLabel = t(`animals.outdoor_types.${schedule.type}`);
  const start = formatLocalizedDate(parseDateOnly(schedule.startDate), locale);
  const weekdays = schedule.recurrence?.byWeekday;
  // Weekday stays are single days; the repetition's until date is the end
  const isWeekdayStay =
    schedule.recurrence?.frequency === "weekly" &&
    weekdays !== null &&
    weekdays !== undefined &&
    weekdays.length > 0;
  const endDate = isWeekdayStay
    ? schedule.recurrence?.until
    : schedule.endDate;
  const end = endDate
    ? formatLocalizedDate(parseDateOnly(endDate), locale)
    : "–";
  let summary = `${typeLabel}: ${start} - ${end}`;
  if (meadowName) summary += ` · ${meadowName}`;
  if (schedule.recurrence) {
    const frequency = t(
      `animals.frequency_types.${schedule.recurrence.frequency}`,
    );
    // Short localized weekday names; 2024-01-01 is a Monday
    const weekdayFormatter = new Intl.DateTimeFormat(locale, {
      weekday: "short",
    });
    const weekdayNames =
      isWeekdayStay && weekdays && weekdays.length < 7
        ? weekdays
            .map((weekday) => WEEKDAY_ORDER.indexOf(weekday))
            .sort((a, b) => a - b)
            .map((index) =>
              weekdayFormatter.format(new Date(2024, 0, 1 + index)),
            )
            .join(", ")
        : null;
    summary += weekdayNames
      ? ` (${frequency}: ${weekdayNames})`
      : ` (${frequency})`;
  }
  return summary;
}
