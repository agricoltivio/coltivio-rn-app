import DateTimePicker from "@react-native-community/datetimepicker";
import { formatLocalizedDate } from "@/utils/date";
import { getDaysInMonth, isSameDay, startOfDay } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Platform, Pressable, View } from "react-native";
import { useTheme } from "styled-components/native";
import { Text } from "@/components/text/Text";
import { TextInput } from "../inputs/TextInput";

// Date field for use inside a bottom drawer. The regular DatePicker opens its own drawer,
// which can't stack on top of another one. This shows the calendar inline below the field
// on iOS; Android uses its native date dialog, which is no drawer.
export function InlineDatePicker({
  label,
  date,
  onChange,
  minimumDate,
  maximumDate,
  error,
  onOpenChange,
}: {
  label: string;
  date: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  // The calendar was opened or closed, e.g. to hide other fields while it's open
  onOpenChange?: (open: boolean) => void;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  function changeOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }
  // A year or month was picked in the iOS calendar's wheel and no day since, so the wheel is
  // probably still showing. "Fertig" then goes back to the days (by remounting the calendar)
  // instead of closing.
  const [pickedYearOrMonth, setPickedYearOrMonth] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

  return (
    <View>
      {/* Hidden while the iOS calendar is open: it shows the date itself, and "Fertig" or a
          day closes it */}
      {!(open && Platform.OS === "ios") && (
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            setPickedYearOrMonth(false);
            changeOpen(!open);
          }}
        >
          <View pointerEvents="none">
            <TextInput
              label={label}
              value={formatLocalizedDate(date, i18n.language, "long")}
              error={error}
            />
          </View>
        </Pressable>
      )}
      {open && Platform.OS === "ios" && (
        <View>
          <DateTimePicker
            key={calendarKey}
            value={date}
            mode="date"
            display="inline"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale={i18n.language}
            themeVariant="light"
            onValueChange={(_event, selectedDate) => {
              onChange(selectedDate);
              // Picking a year or month in the calendar's wheel also changes the value but
              // keeps the day of month: stay open so the day can still be chosen. A tapped
              // day closes: a different day of month (also after browsing with the month
              // arrows, which don't change the value), or any day in the same month and year.
              const monthOrYearChanged =
                selectedDate.getFullYear() !== date.getFullYear() ||
                selectedDate.getMonth() !== date.getMonth();
              // The wheel can't keep a day the new month doesn't have (31 Mar → Feb) or that
              // lies outside the allowed range: iOS moves it to the month's last day or to the
              // limit. Such a change is still the wheel, not a tapped day.
              // The day the wheel would keep (the month may be shorter); it only clamps to a
              // limit when that day lies beyond it, so a tapped day equal to the limit after
              // browsing with the arrows still counts as a tap
              const keptDay = startOfDay(
                new Date(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  Math.min(date.getDate(), getDaysInMonth(selectedDate)),
                ),
              );
              const clampedByWheel =
                monthOrYearChanged &&
                ((selectedDate.getDate() < date.getDate() &&
                  selectedDate.getDate() === getDaysInMonth(selectedDate)) ||
                  (maximumDate !== undefined &&
                    isSameDay(selectedDate, maximumDate) &&
                    keptDay > startOfDay(maximumDate)) ||
                  (minimumDate !== undefined &&
                    isSameDay(selectedDate, minimumDate) &&
                    keptDay < startOfDay(minimumDate)));
              const pickedDay =
                !monthOrYearChanged ||
                (selectedDate.getDate() !== date.getDate() && !clampedByWheel);
              if (pickedDay) {
                setPickedYearOrMonth(false);
                changeOpen(false);
              } else {
                setPickedYearOrMonth(true);
              }
            }}
          />
          {/* The field (with its error) is hidden meanwhile, so show the error here */}
          {error && (
            <Text
              style={{
                color: theme.colors.danger,
                marginTop: theme.spacing.xs,
              }}
            >
              {error}
            </Text>
          )}
          {/* Tapping the already selected day sends no change, so it can't close the
              calendar: this closes it with the current date. After picking a year or month
              it first goes back to the days. */}
          <Pressable
            onPress={() => {
              if (pickedYearOrMonth) {
                setPickedYearOrMonth(false);
                setCalendarKey((key) => key + 1);
              } else {
                changeOpen(false);
              }
            }}
            hitSlop={8}
            style={{ alignSelf: "flex-end", paddingVertical: theme.spacing.xs }}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
              {t("buttons.done")}
            </Text>
          </Pressable>
        </View>
      )}
      {open && Platform.OS === "android" && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_event, selectedDate) => {
            changeOpen(false);
            onChange(selectedDate);
          }}
          onDismiss={() => changeOpen(false)}
        />
      )}
    </View>
  );
}
