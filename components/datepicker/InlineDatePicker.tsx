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
}: {
  label: string;
  date: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
}) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          setOpen((isOpen) => !isOpen);
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
      {open && Platform.OS === "ios" && (
        <View>
          <DateTimePicker
            value={date}
            mode="date"
            display="inline"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            locale={i18n.language}
            themeVariant="light"
            onValueChange={(_event, selectedDate) => {
              onChange(selectedDate);
              // Picking a year or month in the calendar's wheel also changes the value: stay
              // open so the day can still be chosen. Close once a day of the shown month is
              // tapped (same month and year as before).
              const pickedDayOfShownMonth =
                selectedDate.getFullYear() === date.getFullYear() &&
                selectedDate.getMonth() === date.getMonth();
              if (pickedDayOfShownMonth) setOpen(false);
            }}
          />
          {/* Tapping the already selected day sends no change, so it can't close the
              calendar: this closes it with the current date */}
          <Pressable
            onPress={() => setOpen(false)}
            hitSlop={8}
            style={{ alignSelf: "flex-end", paddingVertical: theme.spacing.xs }}
          >
            <Text style={{ color: theme.colors.primary, fontWeight: "600" }}>
              {t("buttons.finish")}
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
            setOpen(false);
            onChange(selectedDate);
          }}
          onDismiss={() => setOpen(false)}
        />
      )}
    </View>
  );
}
