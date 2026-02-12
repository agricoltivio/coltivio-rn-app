import DateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import { Dimensions, Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import { locale } from "@/locales/i18n";
import { Ionicons } from "@expo/vector-icons";

type CompactDatePickerProps = {
  date: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  onDateChange: (date: Date) => void;
  label?: string;
  /** Text shown on the chip when no date has been selected yet */
  placeholder?: string;
  /** Whether the date is considered "set" — when false, shows placeholder text instead of a formatted date */
  hasValue?: boolean;
  /** Show a clear (x) button on the chip */
  onClear?: () => void;
  /** Open the picker immediately on mount */
  autoOpen?: boolean;
};

const POPOVER_HEIGHT = 370;
const HORIZONTAL_MARGIN = 16;

/**
 * A compact inline date picker rendered as a tappable chip.
 * On iOS opens a popover-style calendar anchored to the chip (no Modal — safe inside modals).
 * On Android opens the native date dialog.
 */
export function CompactDatePicker({
  date,
  onDateChange,
  label,
  minimumDate,
  maximumDate,
  placeholder,
  hasValue = true,
  onClear,
  autoOpen,
}: CompactDatePickerProps) {
  const theme = useTheme();
  const containerRef = useRef<View>(null);
  const [visible, setVisible] = useState(false);
  // Offset relative to the chip for popover positioning
  const [popoverStyle, setPopoverStyle] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    right: number;
  } | null>(null);
  const [androidOpen, setAndroidOpen] = useState(autoOpen ?? false);
  const hasAutoOpened = useRef(false);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

  const chipText = hasValue ? formattedDate : (placeholder ?? formattedDate);

  // Measure container and compute popover position relative to it
  const openPicker = useCallback(() => {
    if (Platform.OS === "ios") {
      containerRef.current?.measureInWindow((containerX, containerY, containerW, containerH) => {
        const screen = Dimensions.get("window");
        const spaceBelow = screen.height - (containerY + containerH);
        const showBelow = spaceBelow >= POPOVER_HEIGHT + 8;

        // Calculate left/right offsets so the popover is screen-centered
        // with HORIZONTAL_MARGIN on each side, relative to the container
        const popoverLeft = -(containerX - HORIZONTAL_MARGIN);
        const popoverRight = -(screen.width - containerX - containerW - HORIZONTAL_MARGIN);

        setPopoverStyle(
          showBelow
            ? { top: containerH + 8, left: popoverLeft, right: popoverRight }
            : { bottom: containerH + 8, left: popoverLeft, right: popoverRight },
        );
        setVisible(true);
      });
    } else {
      setAndroidOpen(true);
    }
  }, []);

  const dismiss = useCallback(() => setVisible(false), []);

  // Auto-open on mount for iOS
  useEffect(() => {
    if (autoOpen && !hasAutoOpened.current && Platform.OS === "ios") {
      hasAutoOpened.current = true;
      const timer = setTimeout(() => openPicker(), 100);
      return () => clearTimeout(timer);
    }
  }, [autoOpen, openPicker]);

  return (
    <View ref={containerRef} style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.xs, zIndex: visible ? 9999 : 0 }}>
      {label && (
        <Text style={{ fontSize: 14, color: theme.colors.gray2 }}>
          {label}
        </Text>
      )}
      <Pressable
        onPress={visible ? dismiss : openPicker}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme.colors.gray5,
          paddingHorizontal: theme.spacing.s,
          paddingVertical: theme.spacing.xs,
          borderRadius: 8,
          gap: theme.spacing.xs,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: hasValue ? theme.colors.text : theme.colors.gray2,
          }}
        >
          {chipText}
        </Text>
        {onClear && hasValue && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onClear();
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.gray2} />
          </Pressable>
        )}
      </Pressable>

      {/* iOS: popover calendar anchored to chip — no Modal, uses absolute positioning */}
      {Platform.OS === "ios" && visible && popoverStyle && (
        <>
          {/* Invisible full-screen dismiss area */}
          <Pressable
            onPress={dismiss}
            style={{
              position: "absolute",
              top: -5000,
              bottom: -5000,
              left: -5000,
              right: -5000,
              zIndex: 9998,
            }}
          />
          {/* Calendar popover */}
          <View
            style={{
              position: "absolute",
              ...popoverStyle,
              zIndex: 9999,
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.gray4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              overflow: "hidden",
            }}
          >
            <DateTimePicker
              value={date}
              mode="date"
              display="inline"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              themeVariant="light"
              onChange={(_event, selectedDate) => {
                if (selectedDate) {
                  onDateChange(selectedDate);
                  setVisible(false);
                }
              }}
            />
          </View>
        </>
      )}

      {/* Android: native date dialog */}
      {Platform.OS === "android" && androidOpen && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(event, selectedDate) => {
            setAndroidOpen(false);
            if (event.type === "set" && selectedDate) {
              onDateChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}
