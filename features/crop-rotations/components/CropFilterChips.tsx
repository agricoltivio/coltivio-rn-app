import { stringToColor, hexToRgba } from "@/theme/theme";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";

type CropFilterChipsProps = {
  cropNames: string[];
  selectedCropNames: Set<string>;
  onToggleCrop: (cropName: string) => void;
};

export function CropFilterChips({
  cropNames,
  selectedCropNames,
  onToggleCrop,
}: CropFilterChipsProps) {
  const theme = useTheme();

  if (cropNames.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.xs }}
    >
      {cropNames.map((cropName) => {
        const isSelected = selectedCropNames.has(cropName);
        const cropColor = stringToColor(cropName);

        return (
          <TouchableOpacity
            key={cropName}
            onPress={() => onToggleCrop(cropName)}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: theme.radii.xxl,
              backgroundColor: isSelected ? cropColor : theme.colors.white,
              borderWidth: 1,
              borderColor: isSelected ? cropColor : theme.colors.gray3,
              gap: 6,
            }}
          >
            {/* Color dot */}
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: isSelected ? theme.colors.white : cropColor,
              }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: isSelected ? theme.colors.white : theme.colors.gray1,
              }}
            >
              {cropName}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
