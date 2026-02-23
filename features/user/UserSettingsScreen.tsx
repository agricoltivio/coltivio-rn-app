import { ContentView } from "@/components/containers/ContentView";
import { Switch } from "@/components/inputs/Switch";
import { List } from "@/components/list/List";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2 } from "@/theme/Typography";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "./LocalSettingsContext";

export function OnboardingSettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation();
  const { localSettings, updateLocalSettings } = useLocalSettings();

  return (
    <ContentView>
      <ScrollView
        headerTitleOnScroll={t("settings.settings")}
        showHeaderOnScroll
      >
        <H2>{t("settings.settings")}</H2>
        <Switch
          label={t("settings.onboardings")}
          value={!localSettings.onboardingsDisabled}
          onChange={(e) =>
            updateLocalSettings("onboardingsDisabled", !e.nativeEvent.value)
          }
          style={{
            paddingVertical: theme.spacing.s,
            marginTop: theme.spacing.m,
          }}
        />
        <Body style={{ color: theme.colors.gray2 }}>
          {t("settings.disable_onboardings_info")}
        </Body>

        {__DEV__ && (
          <List title="Developer" style={{ marginTop: theme.spacing.l }}>
            <List.Item
              title="Developer Settings"
              onPress={() => navigation.navigate("DevSettings" as never)}
              hideBottomDivider
            />
          </List>
        )}
      </ScrollView>
    </ContentView>
  );
}
