import { ScrollView, Text, TouchableOpacity } from "react-native";
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
      {items.map((item) => {
        const isSelected = selectedItems.has(item);
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onToggle(item)}
            activeOpacity={0.7}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: theme.radii.xxl,
              backgroundColor: isSelected
                ? theme.colors.primary
                : theme.colors.white,
              borderWidth: 1,
              borderColor: isSelected
                ? theme.colors.primary
                : theme.colors.gray3,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: isSelected ? theme.colors.white : theme.colors.gray1,
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
