import { Body, H3 } from "@/theme/Typography";
import { Trans, useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { useTheme } from "styled-components/native";

// Shown in the plot lists while the farm has no plots: points to the web import, same text as FarmCreatedModal.
export function PlotsEmptyState() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={{ padding: theme.spacing.l }}>
      <H3 style={{ marginBottom: theme.spacing.s }}>
        {t("plots.empty_state_title")}
      </H3>
      <Body>
        <Trans
          i18nKey="plots.empty_state_body"
          components={{
            email: (
              <Body
                style={{ fontWeight: "bold", textDecorationLine: "underline" }}
                onPress={() => Linking.openURL("mailto:support@coltivio.ch")}
              />
            ),
          }}
        />
      </Body>
    </View>
  );
}
