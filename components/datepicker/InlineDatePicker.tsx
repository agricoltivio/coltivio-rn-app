import DateTimePicker from "@react-native-community/datetimepicker";
import { formatLocalizedDate } from "@/utils/date";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard, Platform, Pressable, View } from "react-native";
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
  const { i18n } = useTranslation();
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
        <DateTimePicker
          value={date}
          mode="date"
          display="inline"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          locale={i18n.language}
          themeVariant="light"
          onChange={(_event, selectedDate) => {
            if (!selectedDate) return;
            onChange(selectedDate);
            setOpen(false);
          }}
        />
      )}
      {open && Platform.OS === "android" && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(event, selectedDate) => {
            setOpen(false);
            if (event.type === "set" && selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}
