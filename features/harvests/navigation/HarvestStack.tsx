import { Stack } from "@/navigation/stack";
import { DivideHarvestOnPlotsScreen } from "../add/DivideHarvestOnPlotsScreen";
import { ConfigureHarvestScreen } from "../add/ConfigureHarvestScreen";
import { HarvestSummaryScreen } from "../add/HarvestSummaryScreen";
import { SelectHarvestCropAndDateScreen } from "../add/SelectHarvestCropAndDateScreen";
import { SelectHarvestPlotsScreen } from "../add/SelectHarvestPlotsScreen";
import { SetHarvestQuantityScreen } from "../add/SetHarvestQuantityScreen";
import { HarvestDetailsScreen } from "../HarvestDetailsScreen";
import { HarvestListScreen } from "../HarvestListScreen";
import { HarvestsOfYearScreen } from "../HarvestOfYearScreen";
import { HarvestsScreen } from "../HarvestsScreen";

export function renderHarvestStack() {
  return [
    <Stack.Screen
      key="harvests"
      name="Harvests"
      options={{
        title: "",
      }}
      component={HarvestsScreen}
    />,
    <Stack.Screen
      key="harvests-of-year"
      name="HarvestsOfYear"
      options={{
        title: "",
      }}
      component={HarvestsOfYearScreen}
    />,
    <Stack.Screen
      key="harvest-details"
      name="HarvestDetails"
      component={HarvestDetailsScreen}
      options={{ title: "" }}
    />,
    <Stack.Screen
      key="select-harvest-crop-and-date"
      name="SelectHarvestCropAndDate"
      options={{
        title: "",
      }}
      component={SelectHarvestCropAndDateScreen}
    />,
    <Stack.Screen
      key="configure-harvest"
      name="ConfigureHarvest"
      options={{
        title: "",
      }}
      component={ConfigureHarvestScreen}
    />,
    <Stack.Screen
      key="set-harvest-quantity"
      name="SetHarvestQuantity"
      options={{
        title: "",
      }}
      component={SetHarvestQuantityScreen}
    />,
    <Stack.Screen
      key="select-harvest-plots"
      name="SelectHarvestPlots"
      options={{
        title: "",
        headerShown: false,
      }}
      component={SelectHarvestPlotsScreen}
    />,
    <Stack.Screen
      key="divide-harvest-on-plots"
      name="DivideHarvestOnPlots"
      options={{
        title: "",
      }}
      component={DivideHarvestOnPlotsScreen}
    />,
    <Stack.Screen
      key="harvest-summary"
      name="HarvestSummary"
      options={{
        title: "",
      }}
      component={HarvestSummaryScreen}
    />,
    <Stack.Screen
      key="harvests-of-year-list"
      name="HarvestsOfYearList"
      component={HarvestListScreen}
      options={{
        title: "",
      }}
    />,
  ];
}
