import { useHeaderHeight } from "@react-navigation/elements";
import React from "react";
import { View, ViewProps, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";

import { BrandBackground } from "@/components/branding/BrandBackground";
import { AUTH_HEADER_OFFSET } from "@/components/branding/brand";

type BrandedContentViewProps = ViewProps & {
  style?: ViewStyle;
  footerComponent?: React.ReactNode;
};

/**
 * ContentView for screens under the brand gradient with a transparent,
 * floating header (AuthStack's brandHeader): renders the gradient ground
 * itself, and clears the header using its real measured height instead of
 * a hardcoded offset; falls back to AUTH_HEADER_OFFSET only if
 * react-navigation hasn't measured one yet.
 */
export const BrandedContentView: React.FC<BrandedContentViewProps> = ({
  style,
  children,
  footerComponent,
  ...rest
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  return (
    <BrandBackground>
      <View
        style={[
          {
            paddingHorizontal: theme.spacing.m,
            flex: 1,
            paddingTop: headerHeight || insets.top + AUTH_HEADER_OFFSET,
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
