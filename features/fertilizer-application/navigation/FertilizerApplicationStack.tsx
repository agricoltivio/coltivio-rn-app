import { Stack } from "@/navigation/stack";
import { DivideFertilizerApplicationOnPlotsScreen } from "../add/DivideFertilizerApplicationOnPlotsScreen";
import { SelectFertilizerApplicationPlotsScreen } from "../add/SelectFertilizerApplicationPlotsScreen";
import { FertilizerApplicationSummaryScreen } from "../add/FertilizerApplicationSummaryScreen";
import { ConfigureFertilizerApplicationScreen } from "../add/ConfigureFertilizerApplicationScreen";
import { SelectFertilizerAndDateScreen } from "../add/SelectFertilizerAndDateScreen";
import { SetFertilizerApplicationUnitQuantityScreen } from "../add/SetFertilizerApplicationUnitQuantityScreen";
import { FertilizerApplicationDetailsScreen } from "../FertilizerApplicationDetails";
import { FertilizerApplicationsOfYearListScreen } from "../FertilizerApplicationsListScreen";
import { FertilizerApplicationsOfYearScreen } from "../FertilizerApplicationsOfYearScreen";
import { FertilizerApplicationsScreen } from "../FertilizerApplicationsScreen";

export function renderFertilizerApplicationStack() {
  return [
    <Stack.Screen
      key="fertilizer-applications"
      name="FertilizerApplications"
      options={{ title: "" }}
      component={FertilizerApplicationsScreen}
    />,
    <Stack.Screen
      key="fertilizer-applications-of-year"
      name="FertilizerApplicationsOfYear"
      options={{ title: "" }}
      component={FertilizerApplicationsOfYearScreen}
    />,
    <Stack.Screen
      key="fertilizer-applications-of-year-list"
      name="FertilizerApplicationsOfYearList"
      options={{ title: "" }}
      component={FertilizerApplicationsOfYearListScreen}
    />,
    <Stack.Screen
      key="fertilizer-application-details"
      name="FertilizerApplicationDetails"
      options={{ title: "" }}
      component={FertilizerApplicationDetailsScreen}
    />,
    <Stack.Screen
      key="select-fertilizer-and-date"
      name="SelectFertilizerAndDate"
      options={{ title: "" }}
      component={SelectFertilizerAndDateScreen}
    />,
    <Stack.Screen
      key="configure-fertilizer-application"
      name="ConfigureFertilizerApplication"
      options={{ title: "" }}
      component={ConfigureFertilizerApplicationScreen}
    />,
    <Stack.Screen
      key="set-fertilizer-application-unit-quantity"
      name="SetFertilizerApplicationUnitQuantity"
      options={{ title: "" }}
      component={SetFertilizerApplicationUnitQuantityScreen}
    />,
    <Stack.Screen
      key="select-fertilizer-application-plots"
      name="SelectFertilizerApplicationPlots"
      options={{ title: "", headerShown: false }}
      component={SelectFertilizerApplicationPlotsScreen}
    />,
    <Stack.Screen
      key="divide-fertilizer-application-on-plots"
      name="DivideFertilizerApplicationOnPlots"
      options={{ title: "" }}
      component={DivideFertilizerApplicationOnPlotsScreen}
    />,
    <Stack.Screen
      key="fertilizer-application-summary"
      name="FertilizerApplicationSummary"
      options={{ title: "" }}
      component={FertilizerApplicationSummaryScreen}
    />,
  ];
}
