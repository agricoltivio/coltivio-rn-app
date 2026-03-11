import { ContentView } from "@/components/containers/ContentView";
import { Switch } from "@/components/inputs/Switch";
import { ScrollView } from "@/components/views/ScrollView";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { H2 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";

export function WikiSettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { localSettings, updateLocalSettings } = useLocalSettings();

  return (
    <ScrollView headerTitleOnScroll={t("wiki.settings")} showHeaderOnScroll>
      <ContentView>
        <H2>{t("wiki.settings")}</H2>
        <Switch
          label={t("wiki.only_private")}
          value={localSettings.wikiOnlyPrivate}
          onChange={(e) => updateLocalSettings("wikiOnlyPrivate", e.nativeEvent.value)}
          style={{ marginTop: theme.spacing.l }}
        />
      </ContentView>
    </ScrollView>
  );
}
