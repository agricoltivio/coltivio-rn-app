import { PlotCropRotation } from "@/api/crop-rotations.api";
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

  function handleDateSelect(selectedDate: Date) {
    // Check if before minimum date
    if (minimumDate && selectedDate.getTime() < minimumDate.getTime()) {
      return;
    }
    // Allow selecting any date - existing rotations are just shown as indication
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
