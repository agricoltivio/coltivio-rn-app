import { Stack } from "@/navigation/stack";
import { DefaultTheme } from "styled-components/native";
import { WikiListScreen } from "../WikiListScreen";
import { WikiDetailScreen } from "../WikiDetailScreen";
import { WikiEntryFormScreen } from "../WikiEntryFormScreen";
import { WikiOnboardingScreen } from "../WikiOnboardingScreen";

export function renderWikiStack(_theme: DefaultTheme, _navigation: any) {
  return [
    <Stack.Screen
      key="wiki-list"
      name="WikiList"
      options={{
        title: "",
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
      key="wiki-onboarding"
      name="WikiOnboarding"
      options={{ headerShown: false }}
      component={WikiOnboardingScreen}
    />,
  ];
}
