import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";
import { Select } from "@/components/select/Select";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "styled-components/native";
import { OutdoorScheduleEditScreenProps } from "./navigation/animals-routes";

export function OutdoorScheduleEditScreen({
  route,
  navigation,
}: OutdoorScheduleEditScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { previousScreen, scheduleId, schedule } = route.params;
  const isEditing = !!scheduleId;

  const [startDate, setStartDate] = useState(() =>
    schedule ? new Date(schedule.startDate) : new Date(),
  );
  const [endDate, setEndDate] = useState<Date | null>(() =>
    schedule?.endDate ? new Date(schedule.endDate) : null,
  );
  const [hasEndDate, setHasEndDate] = useState(!!schedule?.endDate);
  const [hasRecurrence, setHasRecurrence] = useState(!!schedule?.recurrence);
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "yearly">(
    schedule?.recurrence?.frequency ?? "weekly",
  );
  const [interval, setInterval] = useState(
    schedule?.recurrence ? String(schedule.recurrence.interval) : "1",
  );
  const [hasUntil, setHasUntil] = useState(!!schedule?.recurrence?.until);
  const [until, setUntil] = useState<Date>(
    schedule?.recurrence?.until
      ? new Date(schedule.recurrence.until)
      : new Date(new Date().getFullYear() + 3, 11, 31),
  );

  // Compute duration in days and filter frequency options accordingly
  const durationDays = useMemo(() => {
    if (!hasEndDate || !endDate) return null;
    return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }, [hasEndDate, endDate, startDate]);

  const frequencyData = useMemo(() => {
    const allFrequencies: Array<{ label: string; value: "weekly" | "monthly" | "yearly" }> = [
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
    navigation.popTo(previousScreen, {
      scheduleResult: {
        action: "save" as const,
        scheduleId,
        input: {
          startDate: startDate.toISOString(),
          endDate: hasEndDate && endDate ? endDate.toISOString() : null,
          notes: null,
          recurrence: hasRecurrence
            ? {
                frequency,
                interval: parseInt(interval) || 1,
                until: hasUntil ? until.toISOString() : null,
              }
            : null,
        },
      },
    }, { merge: true });
  }

  function handleDelete() {
    navigation.popTo(previousScreen, {
      scheduleResult: {
        action: "delete" as const,
        scheduleId,
      },
    }, { merge: true });
  }

  const chipStyle = {
    backgroundColor: theme.colors.gray5,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
    borderRadius: 8,
  } as const;

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
            {isEditing && (
              <Button
                style={{ flexGrow: 1 }}
                type="danger"
                title={t("buttons.delete")}
                onPress={handleDelete}
              />
            )}
            <Button
              style={{ flexGrow: 1 }}
              title={t("buttons.save")}
              onPress={handleSave}
            />
          </View>
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={
          isEditing
            ? t("animals.edit_outdoor_schedule")
            : t("animals.new_outdoor_schedule")
        }
        keyboardAware
      >
        <H2>
          {isEditing
            ? t("animals.edit_outdoor_schedule")
            : t("animals.new_outdoor_schedule")}
        </H2>

        {/* Start date */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: theme.colors.gray1,
            marginTop: theme.spacing.l,
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
          <View style={{ gap: theme.spacing.s }}>
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
            style={{ ...chipStyle, alignSelf: "flex-start" }}
          >
            <Text style={{ fontSize: 15, color: theme.colors.text }}>
              {t("animals.recurrence")}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </ContentView>
  );
}
