import { Stack } from "@/navigation/stack";
import { AddHarvestConfigurationScreen } from "../add/AddHarvestConfigurationScreen";
import { DivideHarvestOnPlotsScreen } from "../add/DivideHarvestOnPlotsScreen";
import { HarvestSummaryScreen } from "../add/HarvestSummaryScreen";
import { SelectHarvestPlotsScreen } from "../add/SelectHarvestPlotsScreen";
import { HarvestDetailsScreen } from "../HarvestDetailsScreen";
import { HarvestListScreen } from "../HarvestListScreen";
import { HarvestsOfYearScreen } from "../HarvestOfYearScreen";
import { HarvestsScreen } from "../HarvestsScreen";
import { AddHarvestAdditionalNotesScreen } from "../add/AddHarvestAdditionalNotesScreen";

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
      key="add-harvest-configuration"
      name="AddHarvestConfiguration"
      options={{
        title: "",
      }}
      component={AddHarvestConfigurationScreen}
    />,
    <Stack.Screen
      key="select-harvest-plots"
      name="SelectHarvstPlots"
      options={{
        title: "Ernte Fläche",
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
      key="add-harvest-additional-notes"
      name="AddHarvestAdditionalNotes"
      options={{
        title: "",
      }}
      component={AddHarvestAdditionalNotesScreen}
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
