import DateTimePicker from "@react-native-community/datetimepicker";
import { TextInput } from "../inputs/TextInput";
import { useCallback, useRef, useState } from "react";
import React from "react";
import { Platform, Pressable, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import { useTranslation } from "react-i18next";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { BottomDrawerModal } from "../bottom-drawer/BottomDrawerModal";
import { Button } from "../buttons/Button";

export type DatePickerProps = {
  mode: "date" | "time";
  locale: string;
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
}: DatePickerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  // Temporary date while user is selecting in iOS modal before confirming
  const [tempDate, setTempDate] = useState<Date>(date || new Date());

  const openPicker = useCallback(() => {
    setTempDate(date || new Date());
    if (Platform.OS === "ios") {
      bottomSheetModalRef.current?.present();
    } else {
      setOpen(true);
    }
  }, [date]);

  const handleConfirm = useCallback(() => {
    onConfirm(tempDate);
    bottomSheetModalRef.current?.dismiss();
  }, [tempDate, onConfirm]);

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
    }
    // } else if (mode === "datetime") {
    //   return new Intl.DateTimeFormat(locale, {
    //     year: "numeric",
    //     month: "long",
    //     day: "numeric",
    //     hour: "numeric",
    //     minute: "numeric",
    //   }).format(date);
    // }
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  }

  return (
    <View>
      <Pressable onPress={openPicker}>
        <View pointerEvents="none">
          <TextInput
            value={formatDate(date)}
            label={label}
            error={error}
            disabled={disabled}
            onBlur={onBlur}
          />
        </View>
      </Pressable>

      {/* iOS: DateTimePicker inside BottomSheetModal with confirm button */}
      {Platform.OS === "ios" && (
        <Portal>
          <BottomSheetModalProvider>
            <BottomDrawerModal ref={bottomSheetModalRef}>
              <DateTimePicker
                value={tempDate}
                onChange={(_event, selectedDate) => {
                  if (selectedDate) {
                    setTempDate(selectedDate);
                  }
                }}
                display={mode === "date" ? "inline" : "spinner"}
                mode={mode}
                themeVariant="light"
              />
              <Button
                title={t("buttons.confirm")}
                onPress={handleConfirm}
                style={{ marginTop: theme.spacing.m }}
              />
            </BottomDrawerModal>
          </BottomSheetModalProvider>
        </Portal>
      )}

      {/* Android: Conditional render shows native dialog */}
      {Platform.OS === "android" && open && (
        <DateTimePicker
          value={date || new Date()}
          onChange={(event, selectedDate) => {
            setOpen(false);
            if (event.type === "set" && selectedDate) {
              onConfirm(selectedDate);
            }
          }}
          display={mode === "date" ? "calendar" : "clock"}
          mode={mode}
        />
      )}

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
