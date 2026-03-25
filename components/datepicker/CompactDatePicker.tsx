import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Platform, Pressable, Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import { locale } from "@/locales/i18n";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/buttons/Button";

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
// Extra height for the confirm button + its margin
const BUTTON_HEIGHT = 52;
const TOTAL_POPOVER_HEIGHT = POPOVER_HEIGHT + BUTTON_HEIGHT;
const HORIZONTAL_MARGIN = 16;
const SCREEN_VERTICAL_PADDING = 8;

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
  const { t } = useTranslation();
  const containerRef = useRef<View>(null);
  const mountedRef = useRef(true);
  const pendingTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const [visible, setVisible] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    right: number;
  } | null>(null);
  const [androidOpen, setAndroidOpen] = useState(autoOpen ?? false);
  const hasAutoOpened = useRef(false);
  // Deferred mount: the native UIDatePicker is only mounted one frame after
  // the popover becomes visible. This ensures any previous native instance is
  // fully deallocated (iOS pools/reuses UIDatePicker and leaks state like
  // the year/month picker mode otherwise).
  const [pickerMounted, setPickerMounted] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    // Captured in the effect body so the cleanup closure uses the same Set instance
    const timers = pendingTimers.current;
    return () => {
      mountedRef.current = false;
      for (const t of timers) clearTimeout(t);
      timers.clear();
    };
  }, []);

  // Mount the native DateTimePicker one frame after the popover opens,
  // unmount immediately when it closes
  useEffect(() => {
    if (visible) {
      const raf = requestAnimationFrame(() => {
        if (mountedRef.current) setPickerMounted(true);
      });
      return () => {
        cancelAnimationFrame(raf);
        setPickerMounted(false);
      };
    } else {
      setPickerMounted(false);
    }
  }, [visible]);

  const safeTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      pendingTimers.current.delete(id);
      if (mountedRef.current) fn();
    }, ms);
    pendingTimers.current.add(id);
    return id;
  }, []);

  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);

  const chipText = hasValue ? formattedDate : (placeholder ?? formattedDate);

  const openPicker = useCallback(() => {
    if (Platform.OS === "ios") {
      containerRef.current?.measureInWindow(
        (containerX, containerY, containerW, containerH) => {
          if (!mountedRef.current) return;
          if (containerW === 0 && containerH === 0) return;

          const screen = Dimensions.get("window");
          const popoverLeft = -(containerX - HORIZONTAL_MARGIN);
          const popoverRight = -(
            screen.width -
            containerX -
            containerW -
            HORIZONTAL_MARGIN
          );

          // Try below first, then above, then clamp to keep fully on-screen
          const spaceBelow = screen.height - (containerY + containerH);
          const spaceAbove = containerY;

          let style: {
            top?: number;
            bottom?: number;
            left: number;
            right: number;
          };

          if (spaceBelow >= TOTAL_POPOVER_HEIGHT + SCREEN_VERTICAL_PADDING) {
            style = {
              top: containerH + 8,
              left: popoverLeft,
              right: popoverRight,
            };
          } else if (
            spaceAbove >=
            TOTAL_POPOVER_HEIGHT + SCREEN_VERTICAL_PADDING
          ) {
            style = {
              bottom: containerH + 8,
              left: popoverLeft,
              right: popoverRight,
            };
          } else {
            // Neither side fits — position so the popover stays within the screen
            // by computing an absolute top and converting to chip-relative offset
            const absoluteTop = Math.max(
              SCREEN_VERTICAL_PADDING,
              Math.min(
                screen.height - TOTAL_POPOVER_HEIGHT - SCREEN_VERTICAL_PADDING,
                containerY + containerH + 8,
              ),
            );
            style = {
              top: absoluteTop - containerY,
              left: popoverLeft,
              right: popoverRight,
            };
          }

          setPopoverStyle(style);
          setVisible(true);
        },
      );
    } else {
      setAndroidOpen(true);
    }
  }, []);

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (autoOpen && !hasAutoOpened.current && Platform.OS === "ios") {
      hasAutoOpened.current = true;
      const id = safeTimeout(() => openPicker(), 100);
      return () => clearTimeout(id);
    }
  }, [autoOpen, openPicker, safeTimeout]);

  return (
    <View
      ref={containerRef}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.xs,
        zIndex: visible ? 9999 : 0,
      }}
    >
      {label && (
        <Text style={{ fontSize: 14, color: theme.colors.gray2 }}>{label}</Text>
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
            <Ionicons
              name="close-circle"
              size={18}
              color={theme.colors.gray2}
            />
          </Pressable>
        )}
      </Pressable>

      {/* iOS: popover calendar anchored to chip — no Modal, uses absolute positioning */}
      {Platform.OS === "ios" && visible && popoverStyle && (
        <>
          <Pressable
            onPress={dismiss}
            style={{
              position: "absolute",
              top: -1000,
              bottom: -1000,
              left: -1000,
              right: -1000,
              zIndex: 9998,
            }}
          />
          <View
            style={{
              position: "absolute",
              ...popoverStyle,
              zIndex: 9999,
              backgroundColor: "rgba(40,40,40, 0.9)",
              borderRadius: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
              overflow: "hidden",
            }}
          >
            {pickerMounted && (
              <>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="inline"
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  themeVariant="dark"
                  onChange={(_event, selectedDate) => {
                    if (!selectedDate) return;
                    // Defer so the native UIDatePicker finishes its delegate
                    // callback before React re-renders
                    safeTimeout(() => onDateChange(selectedDate), 0);
                  }}
                />
                <Button
                  title={t("buttons.confirm")}
                  onPress={dismiss}
                  style={{ margin: theme.spacing.s }}
                  type="accent"
                  fontSize={16}
                />
              </>
            )}
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
