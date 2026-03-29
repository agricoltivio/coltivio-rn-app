import { Stack } from "@/navigation/stack";
import { IonIconButton } from "@/components/buttons/IconButton";
import { DefaultTheme } from "styled-components/native";
import { WikiListScreen } from "../WikiListScreen";
import { WikiDetailScreen } from "../WikiDetailScreen";
import { WikiEntryFormScreen } from "../WikiEntryFormScreen";
import { WikiChangeRequestScreen } from "../WikiChangeRequestScreen";
import { WikiChangeRequestDraftScreen } from "../WikiChangeRequestDraftScreen";
import { WikiSettingsScreen } from "../WikiSettingsScreen";
import { WikiOnboardingScreen } from "../WikiOnboardingScreen";

export function renderWikiStack(theme: DefaultTheme, navigation: any) {
  return [
    <Stack.Screen
      key="wiki-list"
      name="WikiList"
      options={{
        title: "",
        headerRight() {
          return (
            <IonIconButton
              icon="settings-outline"
              type="ghost"
              iconSize={30}
              color={theme.colors.primary}
              onPress={() => navigation.navigate("WikiSettings")}
            />
          );
        },
      }}
      component={WikiListScreen}
    />,
    <Stack.Screen
      key="wiki-detail"
      name="WikiDetail"
      options={{ title: "" }}
      component={WikiDetailScreen}
    />,
    <Stack.Screen
      key="wiki-entry-form"
      name="WikiEntryForm"
      options={{ title: "" }}
      component={WikiEntryFormScreen}
    />,
    <Stack.Screen
      key="wiki-change-request"
      name="WikiChangeRequest"
      options={{ title: "" }}
      component={WikiChangeRequestScreen}
    />,
    <Stack.Screen
      key="wiki-change-request-draft"
      name="WikiChangeRequestDraft"
      options={{ title: "" }}
      component={WikiChangeRequestDraftScreen}
    />,
    <Stack.Screen
      key="wiki-settings"
      name="WikiSettings"
      options={{ title: "" }}
      component={WikiSettingsScreen}
    />,
    <Stack.Screen
      key="wiki-onboarding"
      name="WikiOnboarding"
      options={{ headerShown: false }}
      component={WikiOnboardingScreen}
    />,
  ];
}
