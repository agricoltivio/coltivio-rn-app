import React from "react";
import { View, ViewProps, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

type ContentViewProps = ViewProps & {
  style?: ViewStyle;
  headerVisible?: boolean;
  footerComponent?: React.ReactNode;
};

export const ContentView: React.FC<ContentViewProps> = ({
  style,
  headerVisible = true,
  children,
  footerComponent,
  ...rest
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <>
      <View
        style={[
          {
            paddingHorizontal: theme.spacing.m,
            flex: 1,
            paddingTop: headerVisible
              ? theme.spacing.s
              : insets.top + theme.spacing.l,
            paddingBottom: footerComponent
              ? undefined
              : insets.bottom + theme.spacing.s,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
      {footerComponent}
    </>
  );
};
