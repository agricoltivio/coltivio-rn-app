import { forwardRef } from "react";
import {
  Text as RNText,
  StyleSheet,
  TextProps,
  TextStyle,
} from "react-native";
import { FONT_BOLD, FONT_REGULAR, isBoldFontWeight } from "@/theme/fonts";

// The app-wide Inter font is applied here so every screen gets it by
// importing this instead of react-native's Text directly (enforced by the
// no-restricted-imports eslint rule). Components that set their own
// fontFamily (e.g. icon glyphs rendered via a Text host) are left untouched.
export const Text = forwardRef<RNText, TextProps>(function Text(
  { style, ...props },
  ref,
) {
  const flatStyle: TextStyle = StyleSheet.flatten(style) ?? {};
  if (flatStyle.fontFamily) {
    return <RNText ref={ref} style={style} {...props} />;
  }

  const fontFamily = isBoldFontWeight(flatStyle.fontWeight)
    ? FONT_BOLD
    : FONT_REGULAR;

  return (
    <RNText
      ref={ref}
      style={[style, { fontFamily, fontWeight: "normal" }]}
      {...props}
    />
  );
});
