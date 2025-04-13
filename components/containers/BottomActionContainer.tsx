import { PropsWithChildren } from "react";
import { View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

type BottomActionContainerProps = PropsWithChildren & {
  style?: ViewStyle;
  floating?: boolean;
};

export function BottomActionContainer({
  children,
  style,
  floating = false,
}: BottomActionContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.gray5,
          borderTopWidth: 0.5,
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
