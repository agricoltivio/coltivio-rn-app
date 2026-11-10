import { Stack } from "@/navigation/stack";
import { ConfigureSowingScreen } from "../add/ConfigureSowingScreen";
import { DivideSowingOnPlotsScreen } from "../add/DivideSowingOnPlotsScreen";
import { SelectSowingPlotsScreen } from "../add/SelectSowingPlotsScreen";
import { SelectSowingSeedAndDateScreen } from "../add/SelectSowingSeedAndDateScreen";
import { SowingSummaryScreen } from "../add/SowingSummaryScreen";
import { EditSowingScreen } from "../EditSowingScreen";
import { SowingDetailsScreen } from "../SowingDetailsScreen";
import { SowingsScreen } from "../SowingsScreen";

export function renderSowingStack() {
  return [
    <Stack.Screen
      key="sowings"
      name="Sowings"
      options={{ title: "" }}
      component={SowingsScreen}
    />,
    <Stack.Screen
      key="sowing-details"
      name="SowingDetails"
      options={{ title: "" }}
      component={SowingDetailsScreen}
    />,
    <Stack.Screen
      key="edit-sowing"
      name="EditSowing"
      options={{ title: "" }}
      component={EditSowingScreen}
    />,
    <Stack.Screen
      key="select-sowing-seed-and-date"
      name="SelectSowingSeedAndDate"
      options={{ title: "" }}
      component={SelectSowingSeedAndDateScreen}
    />,
    <Stack.Screen
      key="select-sowing-plots"
      name="SelectSowingPlots"
      options={{ title: "", headerShown: false }}
      component={SelectSowingPlotsScreen}
    />,
    <Stack.Screen
      key="configure-sowing"
      name="ConfigureSowing"
      options={{ title: "" }}
      component={ConfigureSowingScreen}
    />,
    <Stack.Screen
      key="divide-sowing-on-plots"
      name="DivideSowingOnPlots"
      options={{ title: "" }}
      component={DivideSowingOnPlotsScreen}
    />,
    <Stack.Screen
      key="sowing-summary"
      name="SowingSummary"
      options={{ title: "" }}
      component={SowingSummaryScreen}
    />,
  ];
}
