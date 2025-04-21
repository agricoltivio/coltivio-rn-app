import { Stack } from "@/navigation/stack";
import { AddTillageSelectDateScreen } from "../add/AddTillageSelectDateScreen";
import { AddTillageSelectEquipmentScreen } from "../add/AddTillageSelectEquipmentScreen";
import { AddTillageSelectPlotsScreen } from "../add/AddTillageSelectPlotsScreen";
import { AddTillageSummaryScreen } from "../add/AddTillageSummaryScreen";
import { TillageDetailsScreen } from "../TillageDetails";
import { TillagesOfYearListScreen } from "../TillagesOfYearListScreen";
import { TillagesScreen } from "../TillagesScreen";
import { DefaultTheme } from "styled-components";

export function renderTillagesStack(theme: DefaultTheme) {
  return [
    <Stack.Screen
      key="tillages"
      name="Tillages"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={TillagesScreen}
    />,
    <Stack.Screen
      key="tillages-of-year-list"
      name="TillagesOfYearList"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={TillagesOfYearListScreen}
    />,
    <Stack.Screen
      key="tillage-details"
      name="TillageDetails"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={TillageDetailsScreen}
    />,
    <Stack.Screen
      key="add-tillage-select-date"
      name="AddTillageSelectDate"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={AddTillageSelectDateScreen}
    />,
    <Stack.Screen
      key="add-tillage-select-equipment"
      name="AddTillageSelectEquipment"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={AddTillageSelectEquipmentScreen}
    />,
    <Stack.Screen
      key="add-tillage-select-plots"
      name="AddTillageSelectPlots"
      options={{
        title: "",
        headerShown: false,
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={AddTillageSelectPlotsScreen}
    />,
    <Stack.Screen
      key="add-tillage-summary"
      name="AddTillageSummary"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={AddTillageSummaryScreen}
    />,
  ];
}
