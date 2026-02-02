import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import { locale } from "@/locales/i18n";

type CompactDatePickerProps = {
  date: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onDateChange: (date: Date) => void;
  label?: string;
};

/**
 * A compact inline date picker.
 * On iOS uses the native compact display (tappable chip that shows a calendar popover).
 * On Android renders a chip-like pressable that opens the native date dialog.
 */
export function CompactDatePicker({
  date,
  onDateChange,
  label,
  minimumDate,
  maximumDate,
}: CompactDatePickerProps) {
  const theme = useTheme();

  if (Platform.OS === "ios") {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: theme.spacing.xs,
        }}
      >
        {label && (
          <Text style={{ fontSize: 14, color: theme.colors.gray2 }}>
            {label}
          </Text>
        )}
        <DateTimePicker
          value={date}
          mode="date"
          display="compact"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_event, selectedDate) => {
            if (selectedDate) {
              onDateChange(selectedDate);
            }
          }}
        />
      </View>
    );
  }

  return (
    <AndroidCompactDatePicker
      date={date}
      onDateChange={onDateChange}
      label={label}
    />
  );
}

function AndroidCompactDatePicker({
  date,
  onDateChange,
  label,
}: CompactDatePickerProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

  const handlePress = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
      }}
    >
      {label && (
        <Text style={{ fontSize: 14, color: theme.colors.gray2 }}>{label}</Text>
      )}
      <Pressable
        onPress={handlePress}
        style={{
          backgroundColor: theme.colors.gray5,
          paddingHorizontal: theme.spacing.s,
          paddingVertical: theme.spacing.xs,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 15, color: theme.colors.text }}>
          {formattedDate}
        </Text>
      </Pressable>
      {open && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          onChange={(event, selectedDate) => {
            setOpen(false);
            if (event.type === "set" && selectedDate) {
              onDateChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}
