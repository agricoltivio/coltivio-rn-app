import { Pressable, Text } from "react-native";
import { useTheme } from "styled-components/native";
import { RecurrenceRule } from "../plan-crop-rotations.store";

type RecurrenceChipProps = {
  recurrence?: RecurrenceRule;
  onPress: () => void;
};

export function RecurrenceChip({ recurrence, onPress }: RecurrenceChipProps) {
  const theme = useTheme();

  const getRecurrenceLabel = () => {
    if (!recurrence) return "Add recurrence";

    const { interval, until } = recurrence;
    const yearText = interval === 1 ? "year" : `${interval} years`;

    if (until) {
      const untilDate = new Intl.DateTimeFormat("en", {
        month: "short",
        year: "numeric",
      }).format(until);
      return `Every ${yearText} until ${untilDate}`;
    }

    return `Every ${yearText}`;
  };

  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: recurrence ? theme.colors.primary : theme.colors.gray5,
        borderRadius: 16,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          color: recurrence ? theme.colors.white : theme.colors.gray1,
          fontWeight: "500",
        }}
      >
        {getRecurrenceLabel()}
      </Text>
    </Pressable>
  );
}
