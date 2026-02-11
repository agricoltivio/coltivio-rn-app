import { OutdoorSchedule, OutdoorScheduleCreateInput } from "@/api/herds.api";
import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";
import { Select } from "@/components/select/Select";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "styled-components/native";

type OutdoorScheduleEditModalProps = {
  visible: boolean;
  schedule: OutdoorSchedule | null;
  herdId: string;
  onSave: (input: OutdoorScheduleCreateInput) => void;
  onDelete?: (scheduleId: string) => void;
  onClose: () => void;
};

export function OutdoorScheduleEditModal({
  visible,
  schedule,
  herdId,
  onSave,
  onDelete,
  onClose,
}: OutdoorScheduleEditModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [notes, setNotes] = useState("");
  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [frequency, setFrequency] = useState<
    "weekly" | "monthly" | "yearly"
  >("weekly");
  const [interval, setInterval] = useState("1");
  const [hasUntil, setHasUntil] = useState(false);
  const [until, setUntil] = useState<Date>(
    new Date(new Date().getFullYear() + 3, 11, 31),
  );

  // Reset form when modal opens
  useEffect(() => {
    if (!visible) return;
    if (schedule) {
      setStartDate(new Date(schedule.startDate));
      setEndDate(schedule.endDate ? new Date(schedule.endDate) : null);
      setHasEndDate(!!schedule.endDate);
      setNotes(schedule.notes ?? "");
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
      setStartDate(new Date());
      setEndDate(null);
      setHasEndDate(false);
      setNotes("");
      setHasRecurrence(false);
      setFrequency("weekly");
      setInterval("1");
      setHasUntil(false);
      setUntil(new Date(new Date().getFullYear() + 3, 11, 31));
    }
  }, [visible, schedule]);

  const frequencyData = [
    { label: t("animals.frequency_types.weekly"), value: "weekly" },
    { label: t("animals.frequency_types.monthly"), value: "monthly" },
    { label: t("animals.frequency_types.yearly"), value: "yearly" },
  ];

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
      notes: notes || null,
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

  return (
    <Modal visible={visible} transparent animationType="fade">
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: theme.spacing.xs,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.gray1,
              }}
            >
              {t("animals.end_date")}
            </Text>
            {hasEndDate && (
              <Pressable
                onPress={() => {
                  setHasEndDate(false);
                  setEndDate(null);
                }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.gray2}
                />
              </Pressable>
            )}
          </View>
          {hasEndDate ? (
            <View style={{ marginBottom: theme.spacing.m }}>
              <CompactDatePicker
                date={endDate ?? new Date()}
                onDateChange={(d) => setEndDate(d)}
                minimumDate={startDate}
              />
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setHasEndDate(true);
                setEndDate(new Date());
              }}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: theme.colors.gray5,
                borderRadius: 8,
                marginBottom: theme.spacing.m,
              }}
            >
              <Text style={{ fontSize: 14, color: theme.colors.gray1 }}>
                {t("animals.end_date")}
              </Text>
            </Pressable>
          )}

          {/* Notes */}
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: theme.colors.gray1,
              marginBottom: theme.spacing.xs,
            }}
          >
            {t("animals.notes")}
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t("animals.notes")}
            multiline
            style={{
              borderWidth: 1,
              borderColor: theme.colors.gray3,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 8,
              fontSize: 14,
              minHeight: 60,
              marginBottom: theme.spacing.m,
            }}
          />

          {/* Recurrence (optional) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: theme.spacing.xs,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.gray1,
              }}
            >
              {t("animals.recurrence")}
            </Text>
            {hasRecurrence && (
              <Pressable onPress={() => setHasRecurrence(false)}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.gray2}
                />
              </Pressable>
            )}
          </View>

          {hasRecurrence ? (
            <View
              style={{
                gap: theme.spacing.s,
                marginBottom: theme.spacing.l,
              }}
            >
              <Select
                label={t("animals.frequency")}
                value={frequency}
                data={frequencyData}
                onChange={(val) =>
                  setFrequency(val as "weekly" | "monthly" | "yearly")
                }
              />

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
                  keyboardType="number-pad"
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
              {hasUntil ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: theme.spacing.s,
                  }}
                >
                  <CompactDatePicker
                    date={until}
                    onDateChange={setUntil}
                    minimumDate={startDate}
                  />
                  <Pressable onPress={() => setHasUntil(false)}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={theme.colors.gray2}
                    />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setHasUntil(true)}
                  style={{
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    backgroundColor: theme.colors.gray5,
                    borderRadius: 6,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text style={{ fontSize: 13, color: theme.colors.gray1 }}>
                    {t("animals.end_date")}
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              onPress={() => setHasRecurrence(true)}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                backgroundColor: theme.colors.gray5,
                borderRadius: 8,
                marginBottom: theme.spacing.l,
              }}
            >
              <Text style={{ fontSize: 14, color: theme.colors.gray1 }}>
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
    </Modal>
  );
}
