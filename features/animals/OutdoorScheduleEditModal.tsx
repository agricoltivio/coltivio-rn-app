import { Ionicons } from "@expo/vector-icons";
import {
  OutdoorScheduleCreateInput,
  OutdoorScheduleType,
} from "@/api/herds.api";
import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";
import {
  RecurrencePicker,
  RecurrenceValue,
} from "@/components/recurrence/RecurrencePicker";
import { Select } from "@/components/select/Select";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
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
  const [recurrence, setRecurrence] = useState<RecurrenceValue | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (!visible) return;
    if (schedule) {
      setScheduleType(schedule.type);
      setStartDate(new Date(schedule.startDate));
      setEndDate(schedule.endDate ? new Date(schedule.endDate) : null);
      setHasEndDate(!!schedule.endDate);
      setRecurrence(
        schedule.recurrence
          ? {
              frequency: schedule.recurrence.frequency,
              interval: schedule.recurrence.interval,
              until: schedule.recurrence.until ?? null,
            }
          : null,
      );
    } else {
      setScheduleType("pasture");
      setStartDate(new Date());
      setEndDate(null);
      setHasEndDate(false);
      setRecurrence(null);
    }
  }, [visible, schedule]);

  // Compute duration in days to filter out frequencies shorter than the event span
  const frequencyOptions = useMemo(() => {
    const all: Array<{
      label: string;
      value: "weekly" | "monthly" | "yearly";
    }> = [
      { label: t("animals.frequency_types.weekly"), value: "weekly" },
      { label: t("animals.frequency_types.monthly"), value: "monthly" },
      { label: t("animals.frequency_types.yearly"), value: "yearly" },
    ];
    if (!hasEndDate || !endDate) return all;
    const days = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return all.filter((f) => {
      if (f.value === "weekly" && days > 7) return false;
      if (f.value === "monthly" && days > 31) return false;
      return true;
    });
  }, [hasEndDate, endDate, startDate, t]);

  function handleSave() {
    const input: OutdoorScheduleCreateInput = {
      startDate: startDate.toISOString(),
      endDate: hasEndDate && endDate ? endDate.toISOString() : null,
      type: scheduleType,
      notes: null,
      recurrence: recurrence
        ? {
            frequency: recurrence.frequency,
            interval: recurrence.interval,
            until: recurrence.until ?? null,
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
          <KeyboardAvoidingView
            behavior="padding"
            style={{ width: "100%", maxWidth: 360 }}
          >
            <Pressable
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 16,
                padding: theme.spacing.l,
                width: "100%",
                overflow: "visible",
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
                  onChange={(val) =>
                    setScheduleType(val as OutdoorScheduleType)
                  }
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
                <CompactDatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                />
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
              <View style={{ marginBottom: theme.spacing.l }}>
                <RecurrencePicker
                  value={recurrence}
                  onChange={setRecurrence}
                  frequencyOptions={frequencyOptions}
                />
              </View>

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
                    {t("buttons.confirm")}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      )}
    </Modal>
  );
}
