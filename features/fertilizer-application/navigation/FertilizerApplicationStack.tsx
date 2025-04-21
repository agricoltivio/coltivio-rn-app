import { Stack } from "@/navigation/stack";
import { AddFertilizerApplicationSelectQuantityScreen } from "../add/AddFertilizerApplicaationSelectQuantityScreen";
import { AddFertilizerApplicationDivideOnPlotsScreen } from "../add/AddFertilizerApplicationDivideOnPlotsScreen";
import { AddFertilizerApplicationSelectDateScreen } from "../add/AddFertilizerApplicationSelectDateScreen";
import { AddFertilizerApplicationSelectFertilizerScreen } from "../add/AddFertilizerApplicationSelectFertilizerScreen";
import { AddFertilizerApplicationSelectPlotsScreen } from "../add/AddFertilizerApplicationSelectPlotsScreen";
import { AddFertilizerApplicationSelectSpreaderScreen } from "../add/AddFertilizerApplicationSelectSpreaderScreen";
import { AddFertilizerApplicationSummaryScreen } from "../add/AddFertilizerApplicationSummaryScreen";
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
      key="add-fertilizer-application-select-date"
      name="AddFertilizerApplicationSelectDate"
      options={{ title: "" }}
      component={AddFertilizerApplicationSelectDateScreen}
    />,
    <Stack.Screen
      key="add-fertilizer-application-select-fertilizer"
      name="AddFertilizerApplicationSelectFertilizer"
      options={{
        title: "",
      }}
      component={AddFertilizerApplicationSelectFertilizerScreen}
    />,
    <Stack.Screen
      key="add-fertilizer-application-select-spreader"
      name="AddFertilizerApplicationSelectSpreader"
      options={{ title: "" }}
      component={AddFertilizerApplicationSelectSpreaderScreen}
    />,
    <Stack.Screen
      key="add-fertilizer-application-select-quantity"
      name="AddFertilizerApplicationSelectQuantity"
      options={{ title: "" }}
      component={AddFertilizerApplicationSelectQuantityScreen}
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
      key="add-fertilizer-application-summary"
      name="AddFertilizerApplicationSummary"
      options={{ title: "" }}
      component={AddFertilizerApplicationSummaryScreen}
    />,
  ];
}
