import { Subtitle } from "@/theme/Typography";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "styled-components/native";

export function CategoryFilter({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (item: string) => void;
}) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6 }}
    >
      {items.map((item) => {
        const isSelected = selected.includes(item);
        return (
          <TouchableOpacity
            key={item}
            onPress={() => onToggle(item)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 16,
              backgroundColor: isSelected
                ? theme.colors.primary
                : theme.colors.white,
              borderWidth: 1,
              borderColor: isSelected
                ? theme.colors.primary
                : theme.colors.gray3,
            }}
          >
            <Subtitle
              style={{
                color: isSelected ? "#fff" : theme.colors.gray1,
                fontSize: 13,
              }}
            >
              {item}
            </Subtitle>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
