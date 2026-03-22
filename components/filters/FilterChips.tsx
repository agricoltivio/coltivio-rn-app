import { Chip } from "@/components/chips/Chip";
import { ScrollView } from "react-native";
import { useTheme } from "styled-components/native";

type FilterChipsProps = {
  items: string[];
  selectedItems: Set<string>;
  onToggle: (item: string) => void;
};

export function FilterChips({
  items,
  selectedItems,
  onToggle,
}: FilterChipsProps) {
  const theme = useTheme();

  if (items.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.xs }}
    >
      {items.map((item) => (
        <Chip
          key={item}
          label={item}
          active={selectedItems.has(item)}
          onPress={() => onToggle(item)}
        />
      ))}
    </ScrollView>
  );
}
