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
            style={{
              padding: theme.spacing.s,
              color: theme.colors.primary,
              textAlign: "center",
            }}
          >
            {title}
          </Card.Title>
        ) : null}
        {/* paddingBottom mirrors the title's padding above the icon. Without it
            the only space under the icon is the transparent margin baked into
            the asset, so the icon reads as sitting too low in the tile. */}
        <Card.Content
          style={{
            marginTop: 0,
            paddingBottom: theme.spacing.s,
            overflow: "hidden",
          }}
        >
          {children}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}
