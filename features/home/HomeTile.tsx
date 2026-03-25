import { Card } from "@/components/card/Card";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import { useTheme } from "styled-components/native";

type HomeTileProps = {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle> | undefined;
  disabled?: boolean;
};
export function HomeTile({
  title,
  onPress,
  style,
  children,
  disabled,
}: HomeTileProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity style={[style]} onPress={onPress} disabled={disabled}>
      <Card
        elevated
        style={[
          {
            flex: 1,
            padding: 0,
            backgroundColor: theme.colors.accent,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {title ? (
          <Card.Title
            style={{ padding: theme.spacing.s, color: theme.colors.primary }}
          >
            {title}
          </Card.Title>
        ) : null}
        <Card.Content style={{ marginTop: 0, overflow: "hidden" }}>
          {children}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}
