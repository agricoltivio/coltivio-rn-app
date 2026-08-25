import { Subtitle } from "@/theme/Typography";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

export function ChartLegend({
  items,
}: {
  items: { color: string; label: string }[];
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: theme.spacing.xs,
        marginTop: theme.spacing.s,
      }}
    >
      {items.map((item) => (
        <View
          key={item.label}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: item.color,
            }}
          />
          <Subtitle style={{ fontSize: 12, color: theme.colors.gray2 }}>
            {item.label}
          </Subtitle>
        </View>
      ))}
    </View>
  );
}
