import { Stack } from "@/navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { FieldCalendarExportScreen } from "../FieldCalendarExportScreen";
import { FieldCalendarExportSuccessScreen } from "../FieldCalendarExportSuccessScreen";
import { FieldCalendarScreen } from "../FieldCalendarScreen";
import { FieldCalendarSettingsScreen } from "../FieldCalendarSettingsScreen";
import { FieldCalendarOnboardingScreen } from "../FieldCalendarOnboardingScreen";
import { FieldEventsMapScreen } from "../FieldEventsMapScreen";
import { DefaultTheme } from "styled-components/native";
import { View } from "react-native";

export function renderFieldCalendarStack(theme: DefaultTheme, navigation: any) {
  return [
    <Stack.Screen
      key="field-calendar"
      name="FieldCalendar"
      options={{
        title: "",
        headerRight() {
          return (
            <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.m }}>
              <Ionicons
                size={35}
                name="settings-outline"
                color={theme.colors.primary}
                onPress={() => navigation.navigate("FieldCalendarSettings")}
              />
              <Ionicons
                size={35}
                name="share-outline"
                color={theme.colors.primary}
                onPress={() => navigation.navigate("FieldCalendarExport")}
              />
            </View>
          );
        },
      }}
      component={FieldCalendarScreen}
    />,
    <Stack.Screen
      key="field-calendar-settings"
      name="FieldCalendarSettings"
      options={{
        title: "",
      }}
      component={FieldCalendarSettingsScreen}
    />,
    <Stack.Screen
      key="field-calendar-export"
      name="FieldCalendarExport"
      options={{
        title: "",
      }}
      component={FieldCalendarExportScreen}
    />,
    <Stack.Screen
      key="field-calendar-export-success"
      name="FieldCalendarExportSuccess"
      options={{
        title: "",
      }}
      component={FieldCalendarExportSuccessScreen}
    />,
    <Stack.Screen
      key="field-calendar-onboarding"
      name="FieldCalendarOnboarding"
      options={{
        headerShown: false,
      }}
      component={FieldCalendarOnboardingScreen}
    />,
    <Stack.Screen
      key="field-events-map"
      name="FieldEventsMap"
      options={{
        headerShown: false,
      }}
      component={FieldEventsMapScreen}
    />,
  ];
}
