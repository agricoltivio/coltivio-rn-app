import DateTimePicker from "@react-native-community/datetimepicker";
import { formatLocalizedDate } from "@/utils/date";
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
              const pickedDay =
                selectedDate.getDate() !== date.getDate() ||
                (selectedDate.getFullYear() === date.getFullYear() &&
                  selectedDate.getMonth() === date.getMonth());
              if (pickedDay) {
                setPickedYearOrMonth(false);
                changeOpen(false);
              } else {
                setPickedYearOrMonth(true);
              }
            }}
          />
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
