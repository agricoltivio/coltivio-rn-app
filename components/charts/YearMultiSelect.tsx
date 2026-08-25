import { Subtitle } from "@/theme/Typography";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "styled-components/native";
import { getYearColor } from "./chartColors";

export function YearMultiSelect({
  years,
  selectedYears,
  onToggle,
}: {
  years: number[];
  selectedYears: number[];
  onToggle: (year: number) => void;
}) {
  const theme = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 6 }}
    >
      {years.map((year, index) => {
        const isSelected = selectedYears.includes(year);
        const color = getYearColor(theme, index);
        return (
          <TouchableOpacity
            key={year}
            onPress={() => onToggle(year)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 14,
              backgroundColor: isSelected ? color : theme.colors.white,
              borderWidth: 1.5,
              borderColor: color,
            }}
          >
            <Subtitle
              style={{ color: isSelected ? "#fff" : color, fontSize: 13 }}
            >
              {year}
            </Subtitle>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
