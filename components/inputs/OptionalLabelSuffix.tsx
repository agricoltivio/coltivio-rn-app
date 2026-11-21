import { useTranslation } from "react-i18next";
import { Text } from "@/components/text/Text";
import { useTheme } from "styled-components/native";

// Muted " (optional)" after a field label. Rendered inside the label's Text, so it
// wraps with it. Required fields get no marking.
export function OptionalLabelSuffix() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Text style={{ fontSize: 13, color: theme.colors.gray2 }}>
      {` (${t("forms.optional")})`}
    </Text>
  );
}
