import { PropsWithChildren } from "react";
import { View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

type BottomActionContainerProps = PropsWithChildren & {
  style?: ViewStyle;
  floating?: boolean;
  /** Drops the bar's own fill and divider, for screens on the brand ground. */
  transparent?: boolean;
};

export function BottomActionContainer({
  children,
  style,
  floating = false,
  transparent = false,
}: BottomActionContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          backgroundColor: transparent ? "transparent" : theme.colors.gray5,
          borderTopWidth: transparent ? 0 : 0.5,
          borderColor: theme.colors.gray3,
          padding: theme.spacing.m,
          paddingBottom: insets.bottom + theme.spacing.s,
          ...(floating
            ? {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
              }
            : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
