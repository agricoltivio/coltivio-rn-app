import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "styled-components/native";

// Shown when re-resolving the session after the initial load already
// completed (e.g. creating or switching farms), where the full branded
// SplashView would be too heavy for a brief transition.
export function LoadingScreen() {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
