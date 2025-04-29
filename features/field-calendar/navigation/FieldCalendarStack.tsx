import { Stack } from "@/navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { FieldCalendarExportScreen } from "../FieldCalendarExportScreen";
import { FieldCalendarExportSuccessScreen } from "../FieldCalendarExportSuccessScreen";
import { FieldCalendarScreen } from "../FieldCalendarScreen";
import { DefaultTheme } from "styled-components";

export function renderFieldCalendarStack(theme: DefaultTheme, navigation: any) {
  return [
    <Stack.Screen
      key="field-calendar"
      name="FieldCalendar"
      options={{
        title: "",
        headerRight(props) {
          return (
            <Ionicons
              size={35}
              name="download-outline"
              color={theme.colors.primary}
              onPress={() => navigation.navigate("FieldCalendarExport")}
            />
          );
        },
      }}
      component={FieldCalendarScreen}
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
  ];
}
