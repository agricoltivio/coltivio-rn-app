import { ContentView } from "@/components/containers/ContentView";
import { ListItem } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { AppLocale } from "@/locales/i18n";
import { H2 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useLocalSettings } from "./LocalSettingsContext";
import { LanguageSettingsScreenProps } from "./navigation/user-routes";

// Native language names, shown untranslated.
const LANGUAGE_OPTIONS: { value: AppLocale; label: string }[] = [
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Français" },
  { value: "it", label: "Italiano" },
  { value: "en", label: "English" },
];

export function LanguageSettingsScreen(_props: LanguageSettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { updateLocalSettings } = useLocalSettings();

  return (
    <ScrollView
      headerTitleOnScroll={t("settings.language.title")}
      showHeaderOnScroll
    >
      <ContentView>
        <H2>{t("settings.language.title")}</H2>

        <View
          style={{
            marginTop: theme.spacing.l,
            borderRadius: 10,
            overflow: "hidden",
            backgroundColor: theme.colors.white,
          }}
        >
          {LANGUAGE_OPTIONS.map((option, index) => {
            const isActive = i18n.language === option.value;
            return (
              <ListItem
                key={option.value}
                style={{ backgroundColor: theme.colors.white }}
                hideBottomDivider={index === LANGUAGE_OPTIONS.length - 1}
                onPress={() => {
                  updateLocalSettings("preferredLocale", option.value);
                  i18n.changeLanguage(option.value);
                }}
              >
                <ListItem.Content>
                  <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                    {option.label}
                  </ListItem.Title>
                </ListItem.Content>
                {isActive && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={theme.colors.primary}
                    style={{ marginRight: theme.spacing.m }}
                  />
                )}
              </ListItem>
            );
          })}
        </View>
      </ContentView>
    </ScrollView>
  );
}
