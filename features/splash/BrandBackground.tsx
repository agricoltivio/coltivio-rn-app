import { LinearGradient } from "expo-linear-gradient";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";

import { BRAND_GRADIENT } from "./brand";
import { SplashLineart } from "./SplashLineart";

type BrandBackgroundProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** The brand ground: horizontal gradient with the line art anchored bottom. */
export function BrandBackground({ children, style }: BrandBackgroundProps) {
  return (
    <LinearGradient
      colors={[...BRAND_GRADIENT]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, style]}
    >
      <SplashLineart />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
