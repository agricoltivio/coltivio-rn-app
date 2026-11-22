import i18n from "@/locales/i18n";
import { coltivioTheme } from "@/theme/theme";
import { Text } from "@/components/text/Text";
import { Pressable, View } from "react-native";

// Last resort when an error escapes the screen boundaries, e.g. in a provider.
// Rendered outside the theme and translation providers, so it uses the theme object
// and the i18n instance directly.
export function RootErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 24,
        gap: 16,
        backgroundColor: coltivioTheme.colors.background,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "600",
          color: coltivioTheme.colors.text,
        }}
      >
        {i18n.t("errors.unexpected")}
      </Text>
      <Text style={{ fontSize: 16, color: coltivioTheme.colors.text }}>
        {i18n.t("errors.try_again_later")}
      </Text>
      <Pressable
        onPress={onRetry}
        style={{
          marginTop: 8,
          paddingVertical: 14,
          borderRadius: 10,
          alignItems: "center",
          backgroundColor: coltivioTheme.colors.primary,
        }}
      >
        <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
          {i18n.t("buttons.retry")}
        </Text>
      </Pressable>
    </View>
  );
}
