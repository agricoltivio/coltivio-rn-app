import { Stack } from "@/navigation/stack";
import { AddFertilizerApplicationConfigurationScreen } from "../add/AddFertilizerApplicationConfigurationScreen";
import { AddFertilizerApplicationDivideOnPlotsScreen } from "../add/AddFertilizerApplicationDivideOnPlotsScreen";
import { AddFertilizerApplicationSelectPlotsScreen } from "../add/AddFertilizerApplicationSelectPlotsScreen";
import { AddFertilizerApplicationSummaryScreen } from "../add/AddFertilizerApplicationSummaryScreen";
import { FertilizerApplicationDetailsScreen } from "../FertilizerApplicationDetails";
import { FertilizerApplicationsOfYearListScreen } from "../FertilizerApplicationsListScreen";
import { FertilizerApplicationsOfYearScreen } from "../FertilizerApplicationsOfYearScreen";
import { FertilizerApplicationsScreen } from "../FertilizerApplicationsScreen";
import { AddFertilizerApplicationAdditionalNotesScreen } from "../add/AddFertilizerApplicationAdditionalNotesScreen";

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
      key="add-fertilizer-application-configuration"
      name="AddFertilizerApplicationConfiguration"
      options={{ title: "" }}
      component={AddFertilizerApplicationConfigurationScreen}
    />,
    <Stack.Screen
      key="add-fertilizer-application-select-plots"
      name="AddFertilizerApplicationSelectPlots"
      options={{ title: "", headerShown: false }}
      component={AddFertilizerApplicationSelectPlotsScreen}
    />,
    <Stack.Screen
      key="add-fertilizer-application-divide-on-plots"
      name="AddFertilizerApplicationDivideOnPlots"
      options={{ title: "" }}
      component={AddFertilizerApplicationDivideOnPlotsScreen}
    />,
    <Stack.Screen
      key="add-fertilizer-application-additional-notes"
      name="AddFertilizerApplicationAdditionalNotes"
      options={{ title: "" }}
      component={AddFertilizerApplicationAdditionalNotesScreen}
    />,
    <Stack.Screen
      key="add-fertilizer-application-summary"
      name="AddFertilizerApplicationSummary"
      options={{ title: "" }}
      component={AddFertilizerApplicationSummaryScreen}
    />,
  ];
}
