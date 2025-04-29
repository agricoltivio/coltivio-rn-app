import RnDatePicker, {
  DatePickerProps as RnDatePickerProps,
} from "react-native-date-picker";
import { TextInput } from "../inputs/TextInput";
import { useState } from "react";
import React from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import { useTranslation } from "react-i18next";

export type DatePickerProps = Pick<
  RnDatePickerProps,
  "mode" | "locale" | "date"
> & {
  label: string;
  error?: string;
  disabled?: boolean;
  onBlur?: () => void;
  date?: Date;
  onConfirm: (date?: Date | null) => void;
};

export function DatePicker({
  label,
  error,
  onConfirm,
  date,
  disabled = true,
  onBlur,
  mode,
  locale,
  ...props
}: DatePickerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  function formatDate(date?: Date) {
    if (!date) {
      return;
    }
    if (mode === "date") {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } else if (mode === "datetime") {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(date);
    }
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  }

  return (
    <View>
      <Pressable onPress={() => setOpen(true)}>
        <TextInput
          value={formatDate(date)}
          label={label}
          error={error}
          onPress={() => {
            setOpen(true);
          }}
          disabled={disabled}
          onBlur={onBlur}
        />
      </Pressable>
      <RnDatePicker
        modal
        open={open}
        date={date || new Date()}
        onConfirm={(date) => {
          setOpen(false);
          onConfirm && onConfirm(date);
        }}
        onCancel={() => {
          setOpen(false);
        }}
        mode={mode}
        confirmText={t("buttons.confirm")}
        cancelText={t("buttons.cancel")}
        locale={locale}
        title={t("forms.labels.select_date")}
        {...props}
      />

      {date && (
        <TouchableOpacity
          onPress={() => onConfirm(null)}
          style={{ position: "absolute", top: 25, right: 10, zIndex: 10 }}
        >
          <Ionicons
            name="close-circle-outline"
            size={30}
            color={theme.colors.gray2}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
