import { useHeaderHeight } from "@react-navigation/elements";
import React from "react";
import { StatusBar, View, ViewProps, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

import { BrandBackground } from "@/components/branding/BrandBackground";
import { AUTH_HEADER_OFFSET } from "@/components/branding/brand";

type BrandedContentViewProps = ViewProps & {
  style?: ViewStyle;
  footerComponent?: React.ReactNode;
};

export const BrandedContentView: React.FC<BrandedContentViewProps> = ({
  style,
  children,
  footerComponent,
  ...rest
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const statusBarInset = Math.max(insets.top, StatusBar.currentHeight ?? 0);
  return (
    <BrandBackground>
      <View
        style={[
          {
            paddingHorizontal: theme.spacing.m,
            flex: 1,
            paddingTop: headerHeight || statusBarInset + AUTH_HEADER_OFFSET,
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
    </BrandBackground>
  );
};
