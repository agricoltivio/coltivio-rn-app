import {
  OutdoorScheduleCreateInput,
  OutdoorScheduleType,
} from "@/api/herds.api";
import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";
import { Select } from "@/components/select/Select";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "styled-components/native";

export type ScheduleEditData = {
  id: string;
  startDate: string;
  endDate: string | null;
  type: OutdoorScheduleType;
  recurrence:
    | {
        frequency: "weekly" | "monthly" | "yearly";
        interval: number;
        until?: string | null;
      }
    | null
    | undefined;
};

type OutdoorScheduleEditModalProps = {
  visible: boolean;
  schedule: ScheduleEditData | null;
  onSave: (input: OutdoorScheduleCreateInput) => void;
  onDelete?: (scheduleId: string) => void;
  onClose: () => void;
};

export function OutdoorScheduleEditModal({
  visible,
  schedule,
  onSave,
  onDelete,
  onClose,
}: OutdoorScheduleEditModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [scheduleType, setScheduleType] =
    useState<OutdoorScheduleType>("pasture");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">(
    "weekly",
  );
  const [interval, setInterval] = useState("1");
  const [hasUntil, setHasUntil] = useState(false);
  const [until, setUntil] = useState<Date>(
    new Date(new Date().getFullYear() + 3, 11, 31),
  );

  // Reset form when modal opens
  useEffect(() => {
    if (!visible) return;
    if (schedule) {
      setScheduleType(schedule.type);
      setStartDate(new Date(schedule.startDate));
      setEndDate(schedule.endDate ? new Date(schedule.endDate) : null);
      setHasEndDate(!!schedule.endDate);
      setHasRecurrence(!!schedule.recurrence);
      if (schedule.recurrence) {
        setFrequency(schedule.recurrence.frequency);
        setInterval(String(schedule.recurrence.interval));
        setHasUntil(!!schedule.recurrence.until);
        if (schedule.recurrence.until) {
          setUntil(new Date(schedule.recurrence.until));
        }
      }
    } else {
      setScheduleType("pasture");
      setStartDate(new Date());
      setEndDate(null);
      setHasEndDate(false);
      setHasRecurrence(false);
      setFrequency("weekly");
      setInterval("1");
      setHasUntil(false);
      setUntil(new Date(new Date().getFullYear() + 3, 11, 31));
    }
  }, [visible, schedule]);

  // Compute duration in days and filter frequency options accordingly
  const durationDays = useMemo(() => {
    if (!hasEndDate || !endDate) return null;
    return Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
  }, [hasEndDate, endDate, startDate]);

  const frequencyData = useMemo(() => {
    const allFrequencies: Array<{
      label: string;
      value: "weekly" | "monthly" | "yearly";
    }> = [
      { label: t("animals.frequency_types.weekly"), value: "weekly" },
      { label: t("animals.frequency_types.monthly"), value: "monthly" },
      { label: t("animals.frequency_types.yearly"), value: "yearly" },
    ];
    if (durationDays === null) return allFrequencies;
    return allFrequencies.filter((f) => {
      if (f.value === "weekly" && durationDays > 7) return false;
      if (f.value === "monthly" && durationDays > 31) return false;
      return true;
    });
  }, [durationDays, t]);

  // Auto-switch frequency if current selection becomes invalid
  useEffect(() => {
    const validValues = frequencyData.map((f) => f.value);
    if (!validValues.includes(frequency)) {
      setFrequency(validValues[validValues.length - 1]);
    }
  }, [frequencyData, frequency]);

  // Get the interval label based on frequency and count
  function getIntervalLabel(): string {
    const num = parseInt(interval) || 1;
    switch (frequency) {
      case "weekly":
        return num === 1 ? t("animals.week") : t("animals.weeks");
      case "monthly":
        return num === 1 ? t("animals.month") : t("animals.months");
      case "yearly":
        return num === 1 ? t("animals.year") : t("animals.years");
    }
  }

  function handleSave() {
    const input: OutdoorScheduleCreateInput = {
      startDate: startDate.toISOString(),
      endDate: hasEndDate && endDate ? endDate.toISOString() : null,
      type: scheduleType,
      notes: null,
      recurrence: hasRecurrence
        ? {
            frequency,
            interval: parseInt(interval) || 1,
            until: hasUntil ? until.toISOString() : null,
          }
        : null,
    };
    onSave(input);
  }

  function handleDelete() {
    if (schedule && onDelete) {
      onDelete(schedule.id);
    }
  }

  const chipStyle = {
    backgroundColor: theme.colors.gray5,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: 8,
  } as const;

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Only render content when visible so CompactDatePickers get fresh
          instances each time — prevents stale native state across open/close */}
      {visible && (
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing.m,
          }}
          onPress={onClose}
        >
          <Pressable
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 16,
              padding: theme.spacing.l,
              width: "100%",
              maxWidth: 360,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: theme.colors.text,
                marginBottom: theme.spacing.m,
              }}
            >
              {schedule
                ? t("animals.edit_outdoor_schedule")
                : t("animals.new_outdoor_schedule")}
            </Text>

            {/* Type */}
            <View style={{ marginBottom: theme.spacing.m }}>
              <Select
                label={t("animals.outdoor_type")}
                value={scheduleType}
                data={[
                  {
                    label: t("animals.outdoor_types.pasture"),
                    value: "pasture",
                  },
                  {
                    label: t("animals.outdoor_types.exercise_yard"),
                    value: "exercise_yard",
                  },
                ]}
                onChange={(val) => setScheduleType(val as OutdoorScheduleType)}
              />
            </View>

            {/* Start date */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.gray1,
                marginBottom: theme.spacing.xs,
              }}
            >
              {t("animals.start_date")}
            </Text>
            <View style={{ marginBottom: theme.spacing.m }}>
              <CompactDatePicker date={startDate} onDateChange={setStartDate} />
            </View>

            {/* End date (optional) */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.gray1,
                marginBottom: theme.spacing.xs,
              }}
            >
              {t("animals.end_date_optional")}
            </Text>
            <View style={{ marginBottom: theme.spacing.m }}>
              <CompactDatePicker
                date={endDate ?? new Date()}
                onDateChange={(d) => {
                  setEndDate(d);
                  setHasEndDate(true);
                }}
                minimumDate={startDate}
                placeholder={t("animals.end_date")}
                hasValue={hasEndDate}
                onClear={() => {
                  setHasEndDate(false);
                  setEndDate(null);
                }}
              />
            </View>

            {/* Recurrence (optional) */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.gray1,
                marginBottom: theme.spacing.xs,
              }}
            >
              {t("animals.recurrence_optional")}
            </Text>

            {hasRecurrence ? (
              <View
                style={{
                  gap: theme.spacing.s,
                  marginBottom: theme.spacing.l,
                }}
              >
                {/* Frequency + clear button row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.xs,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Select
                      label={t("animals.frequency")}
                      value={frequency}
                      data={frequencyData}
                      onChange={(val) =>
                        setFrequency(val as "weekly" | "monthly" | "yearly")
                      }
                    />
                  </View>
                  <Pressable onPress={() => setHasRecurrence(false)}>
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={theme.colors.gray2}
                    />
                  </Pressable>
                </View>

                {/* Interval row: "Every N weeks/months/years" */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.s,
                  }}
                >
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>
                    {t("animals.every")}
                  </Text>
                  <TextInput
                    value={interval}
                    onChangeText={(text) => {
                      if (!text) setInterval("");
                      const num = parseInt(text);
                      if (!isNaN(num) && num > 0) setInterval(String(num));
                    }}
                    keyboardType="numbers-and-punctuation"
                    style={{
                      width: 50,
                      borderWidth: 1,
                      borderColor: theme.colors.gray3,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  />
                  <Text style={{ fontSize: 14, color: theme.colors.text }}>
                    {getIntervalLabel()}
                  </Text>
                </View>

                {/* Until date */}
                <CompactDatePicker
                  date={until}
                  onDateChange={(d) => {
                    setUntil(d);
                    setHasUntil(true);
                  }}
                  minimumDate={startDate}
                  label={hasUntil ? t("animals.until") : undefined}
                  placeholder={t("animals.until")}
                  hasValue={hasUntil}
                  onClear={() => setHasUntil(false)}
                />
              </View>
            ) : (
              <Pressable
                onPress={() => setHasRecurrence(true)}
                style={{
                  ...chipStyle,
                  alignSelf: "flex-start",
                  marginBottom: theme.spacing.l,
                }}
              >
                <Text style={{ fontSize: 15, color: theme.colors.text }}>
                  {t("animals.recurrence")}
                </Text>
              </Pressable>
            )}

            {/* Actions */}
            <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
              {schedule && onDelete && (
                <Pressable
                  onPress={handleDelete}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    backgroundColor: theme.colors.danger + "15",
                    borderRadius: 10,
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={theme.colors.danger}
                  />
                </Pressable>
              )}
              <Pressable
                onPress={onClose}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: theme.colors.gray5,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: theme.colors.gray1,
                  }}
                >
                  {t("buttons.cancel")}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: theme.colors.white,
                  }}
                >
                  {t("buttons.save")}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      )}
    </Modal>
  );
}
