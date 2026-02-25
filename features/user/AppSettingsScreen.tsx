import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { AppSettingsScreenProps } from "./navigation/user-routes";

export function AppSettingsScreen({ navigation }: AppSettingsScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ScrollView
      headerTitleOnScroll={t("settings.app_settings")}
      showHeaderOnScroll
    >
      <ContentView>
        <H2>{t("settings.app_settings")}</H2>

        <View
          style={{
            marginTop: theme.spacing.l,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
        >
          <ListItem
            style={{ backgroundColor: theme.colors.white }}
            onPress={() => navigation.navigate("OnboardingSettings")}
          >
            <ListItem.Content>
              <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                {t("settings.onboardings")}
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
          <ListItem
            style={{ backgroundColor: theme.colors.white }}
            onPress={() => navigation.navigate("SpeedDialSettings")}
            hideBottomDivider
          >
            <ListItem.Content>
              <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                {t("settings.speed_dial_settings")}
              </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        </View>
      </ContentView>
    </ScrollView>
  );
}
