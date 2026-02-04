import { PlotCropRotation } from "@/api/crop-rotations.api";
import { INFINITE_DATE, isInfiniteDate } from "@/utils/date";
import { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import { locale } from "@/locales/i18n";
import { CropRotationCalendar } from "./CropRotationCalendar";

type CropRotationDatePickerProps = {
  date: Date;
  mode: "from" | "to";
  plotId: string;
  existingRotations: PlotCropRotation[];
  minimumDate?: Date;
  onDateChange: (date: Date) => void;
  label?: string;
};

// Check if a date is within a rotation period (excluding permanent rotations)
function isDateInRotation(date: Date, rotation: PlotCropRotation): boolean {
  const toDate = new Date(rotation.toDate);
  if (toDate.getTime() >= INFINITE_DATE.getTime()) return false;
  const fromDate = new Date(rotation.fromDate);
  const dateTime = date.getTime();
  return dateTime >= fromDate.getTime() && dateTime <= toDate.getTime();
}

// Get all rotations that include a specific date
function getRotationForDate(
  date: Date,
  rotations: PlotCropRotation[],
): PlotCropRotation | undefined {
  return rotations.find((r) => isDateInRotation(date, r));
}

export function CropRotationDatePicker({
  date,
  existingRotations,
  minimumDate,
  onDateChange,
  label,
}: CropRotationDatePickerProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

  function handleDateSelect(selectedDate: Date, rotation?: PlotCropRotation) {
    // Check if before minimum date
    if (minimumDate && selectedDate.getTime() < minimumDate.getTime()) {
      return;
    }
    // Check if occupied by existing rotation
    if (rotation && !isInfiniteDate(new Date(rotation.toDate))) {
      return;
    }
    onDateChange(selectedDate);
    setIsOpen(false);
  }

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
        onPress={() => setIsOpen(true)}
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

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setIsOpen(false)}
        >
          <Pressable
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: 16,
              padding: theme.spacing.m,
              width: "90%",
              maxWidth: 400,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <CropRotationCalendar
              rotations={existingRotations}
              selectedDate={date}
              onDatePress={handleDateSelect}
              initialDate={date}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
