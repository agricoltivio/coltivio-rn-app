import { Subtitle } from "@/theme/Typography";
import { View } from "react-native";
import { Text } from "@/components/text/Text";
import { useTheme } from "styled-components/native";

export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: theme.radii.l,
        padding: theme.spacing.m,
        alignItems: "center",
        gap: theme.spacing.xxs,
      }}
    >
      <Text
        style={{ fontSize: 28, fontWeight: "700", color: theme.colors.primary }}
      >
        {value}
      </Text>
      <Subtitle
        style={{ textAlign: "center", fontSize: 12, color: theme.colors.gray2 }}
      >
        {label}
      </Subtitle>
    </View>
  );
}
