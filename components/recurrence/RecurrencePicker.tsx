import { CompactDatePicker } from "@/components/datepicker/CompactDatePicker";
import { Select } from "@/components/select/Select";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, TextInput, View } from "react-native";
import { useTheme } from "styled-components/native";

export type RecurrenceFrequency = "weekly" | "monthly" | "yearly";

export type RecurrenceValue = {
  frequency: RecurrenceFrequency;
  interval: number;
  until?: string | null;
};

type RecurrencePickerProps = {
  value: RecurrenceValue | null;
  onChange: (value: RecurrenceValue | null) => void;
  /** Subset of frequencies to offer — defaults to all three */
  frequencyOptions?: { label: string; value: RecurrenceFrequency }[];
};

const DEFAULT_UNTIL = new Date(new Date().getFullYear() + 3, 11, 31);

export function RecurrencePicker({
  value,
  onChange,
  frequencyOptions,
}: RecurrencePickerProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Keep interval as a string so the TextInput can be partially edited
  const [intervalText, setIntervalText] = useState(
    String(value?.interval ?? 1),
  );
  const [untilDate, setUntilDate] = useState<Date>(
    value?.until ? new Date(value.until) : DEFAULT_UNTIL,
  );

  // Sync local state when value is set from outside (edit pre-population)
  useEffect(() => {
    if (value) {
      setIntervalText(String(value.interval));
      if (value.until) setUntilDate(new Date(value.until));
    }
  }, [value]);

  const allFrequencies: { label: string; value: RecurrenceFrequency }[] = [
    { label: t("animals.frequency_types.weekly"), value: "weekly" },
    { label: t("animals.frequency_types.monthly"), value: "monthly" },
    { label: t("animals.frequency_types.yearly"), value: "yearly" },
  ];

  const resolvedFrequencyOptions = frequencyOptions ?? allFrequencies;

  function getIntervalLabel(
    frequency: RecurrenceFrequency,
    interval: number,
  ): string {
    switch (frequency) {
      case "weekly":
        return interval === 1 ? t("animals.week") : t("animals.weeks");
      case "monthly":
        return interval === 1 ? t("animals.month") : t("animals.months");
      case "yearly":
        return interval === 1 ? t("animals.year") : t("animals.years");
    }
  }

  function handleEnable() {
    onChange({ frequency: "weekly", interval: 1, until: null });
  }

  function handleDisable() {
    onChange(null);
  }

  function handleFrequencyChange(freq: RecurrenceFrequency) {
    if (!value) return;
    onChange({ ...value, frequency: freq });
  }

  function handleIntervalChange(text: string) {
    setIntervalText(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num > 0 && value) {
      onChange({ ...value, interval: num });
    }
  }

  function handleUntilChange(date: Date) {
    setUntilDate(date);
    if (value) onChange({ ...value, until: date.toISOString() });
  }

  function handleClearUntil() {
    if (value) onChange({ ...value, until: null });
  }

  if (!value) {
    return (
      <Pressable
        onPress={handleEnable}
        style={{
          alignSelf: "flex-start",
          backgroundColor: theme.colors.gray5,
          paddingHorizontal: theme.spacing.s,
          paddingVertical: theme.spacing.xs,
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 15, color: theme.colors.text }}>
          {t("animals.recurrence")}
        </Text>
      </Pressable>
    );
  }

  const currentInterval = parseInt(intervalText, 10) || 1;

  return (
    <View style={{ gap: theme.spacing.s }}>
      {/* Frequency select + clear */}
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
            value={value.frequency}
            data={resolvedFrequencyOptions}
            onChange={(v) => {
              if (v === "weekly" || v === "monthly" || v === "yearly") {
                handleFrequencyChange(v);
              }
            }}
          />
        </View>
        <Pressable onPress={handleDisable}>
          <Ionicons name="close-circle" size={24} color={theme.colors.gray2} />
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
          value={intervalText}
          onChangeText={handleIntervalChange}
          keyboardType="numbers-and-punctuation"
          returnKeyType="done"
          blurOnSubmit
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
          {getIntervalLabel(value.frequency, currentInterval)}
        </Text>
      </View>

      {/* Until date */}
      <CompactDatePicker
        date={untilDate}
        onDateChange={handleUntilChange}
        label={value.until ? t("animals.until") : undefined}
        placeholder={t("animals.until")}
        hasValue={value.until != null}
        onClear={handleClearUntil}
      />
    </View>
  );
}
