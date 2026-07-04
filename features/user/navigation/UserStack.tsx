import { Stack } from "@/navigation/stack";
import { AppSettingsScreen } from "../AppSettingsScreen";
import { ChangeUserNameScreen } from "../ChangeUserNameScreen";
import { HomeTilesSettingsScreen } from "../HomeTilesSettingsScreen";
import { MapSettingsScreen } from "../MapSettingsScreen";
import { LanguageSettingsScreen } from "../LanguageSettingsScreen";
import { SpeedDialSettingsScreen } from "../SpeedDialSettingsScreen";
import { UserAccountScreen } from "../UserAccountScreen";
import { OnboardingSettingsScreen } from "../UserSettingsScreen";
import { DevSettingsScreen } from "../../farms/DevSettingsScreen";

export function renderUserStack() {
  return [
    <Stack.Screen
      key="user-account"
      name="UserAccount"
      component={UserAccountScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="onboarding-settings"
      name="OnboardingSettings"
      component={OnboardingSettingsScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="app-settings"
      name="AppSettings"
      component={AppSettingsScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="speed-dial-settings"
      name="SpeedDialSettings"
      component={SpeedDialSettingsScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="home-tiles-settings"
      name="HomeTilesSettings"
      component={HomeTilesSettingsScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="map-settings"
      name="MapSettings"
      component={MapSettingsScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="language-settings"
      name="LanguageSettings"
      component={LanguageSettingsScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="change-user-name"
      name="ChangeUserName"
      component={ChangeUserNameScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="dev-settings"
      name="DevSettings"
      component={DevSettingsScreen}
      options={{
        title: "",
      }}
    />,
  ];
}
