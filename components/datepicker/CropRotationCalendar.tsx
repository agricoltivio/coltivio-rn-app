import { PlotCropRotation } from "@/api/crop-rotations.api";
import { INFINITE_DATE } from "@/utils/date";
import { useState, useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import { locale } from "@/locales/i18n";
import { stringToColor } from "@/theme/theme";

type CropRotationCalendarProps = {
  rotations: PlotCropRotation[];
  initialDate?: Date;
  selectedDate?: Date;
  onDatePress?: (date: Date, rotation?: PlotCropRotation) => void;
  showLegend?: boolean;
};

// Check if a date is within a rotation period (excluding permanent rotations)
function isDateInRotation(date: Date, rotation: PlotCropRotation): boolean {
  const toDate = new Date(rotation.toDate);
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

// Generate calendar grid for a given month/year (always 6 weeks = 42 cells)
function generateCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  const days: (Date | null)[] = [];

  // Leading empty cells
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  // Trailing empty cells to always have 6 weeks (42 cells)
  while (days.length < 42) {
    days.push(null);
  }

  return days;
}

export function CropRotationCalendar({
  rotations,
  initialDate = new Date(),
  selectedDate,
  onDatePress,
  showLegend = true,
}: CropRotationCalendarProps) {
  const theme = useTheme();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const calendarDays = useMemo(
    () => generateCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthName = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
  }).format(new Date(viewYear, viewMonth, 1));

  const weekDays = useMemo(() => {
    const baseDate = new Date(2024, 0, 7); // A Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(baseDate);
      day.setDate(baseDate.getDate() + i);
      return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day);
    });
  }, []);

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  }

  function getDateColor(day: Date): string | undefined {
    const rotation = getRotationForDate(day, rotations);
    if (!rotation) return undefined;
    return stringToColor(rotation?.crop.name) || theme.colors.primary;
  }

  const isSelected = (day: Date) => {
    if (!selectedDate) return false;
    return day.toDateString() === selectedDate.toDateString();
  };

  // Get unique crops active in current month
  const visibleCrops = useMemo(() => {
    const monthStart = new Date(viewYear, viewMonth, 1).getTime();
    const monthEnd = new Date(viewYear, viewMonth + 1, 0, 23, 59, 59).getTime();

    const crops = new Map<string, { name: string; color: string }>();
    rotations.forEach((rotation) => {
      const rotationStart = new Date(rotation.fromDate).getTime();
      const rotationEnd = new Date(rotation.toDate).getTime();

      // Check if rotation overlaps with current month
      if (rotationStart <= monthEnd && rotationEnd >= monthStart) {
        const cropName = rotation.crop.name;
        if (!crops.has(cropName)) {
          crops.set(cropName, {
            name: cropName,
            color: stringToColor(cropName) || theme.colors.primary,
          });
        }
      }
    });
    return Array.from(crops.values());
  }, [viewYear, viewMonth, rotations]);

  return (
    <View>
      {/* Header with month navigation */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.m,
        }}
      >
        <Pressable onPress={handlePrevMonth} style={{ padding: 8 }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>{monthName}</Text>
        <Pressable onPress={handleNextMonth} style={{ padding: 8 }}>
          <Text style={{ fontSize: 20 }}>→</Text>
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: theme.spacing.s,
        }}
      >
        {weekDays.map((day, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: theme.colors.gray2,
                fontWeight: "600",
              }}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid - always 6 weeks */}
      <View style={{ gap: 4 }}>
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <View key={weekIndex} style={{ flexDirection: "row", gap: 4 }}>
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const day = calendarDays[weekIndex * 7 + dayIndex];

              if (!day) {
                return (
                  <View key={dayIndex} style={{ flex: 1, aspectRatio: 1 }} />
                );
              }

              const bgColor = getDateColor(day);
              const selected = isSelected(day);
              const rotation = getRotationForDate(day, rotations);

              // Show existing rotations with low opacity as indication only
              const hasRotation = !!bgColor;

              return (
                <Pressable
                  key={dayIndex}
                  onPress={() => onDatePress?.(day, rotation)}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 8,
                    backgroundColor: selected
                      ? theme.colors.primary
                      : hasRotation
                        ? bgColor + "30" // 30 = ~19% opacity in hex
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: selected ? theme.colors.white : theme.colors.text,
                      fontWeight: selected ? "600" : "400",
                    }}
                  >
                    {day.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      {showLegend && visibleCrops.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            gap: theme.spacing.m,
            marginTop: theme.spacing.s,
          }}
        >
          {visibleCrops.map((crop) => (
            <View
              key={crop.name}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: theme.spacing.xs,
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor: crop.color,
                }}
              />
              <Text style={{ fontSize: 13, color: theme.colors.text }}>
                {crop.name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
