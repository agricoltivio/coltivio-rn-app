import { Stack } from "@/navigation/stack";
import { DivideHarvestOnPlotsScreen } from "../add/DivideHarvestOnPlotsScreen";
import { HarvestSummaryScreen } from "../add/HarvestSummaryScreen";
import { SelectHarvestCropScreen } from "../add/SelectHarvestCropScreen";
import { SelectHarvestDateScreen } from "../add/SelectHarvestDateScreen";
import { SelectHarvestingMachineryScreen } from "../add/SelectHarvestingMachineryScreen";
import { SelectHarvestPlotsScreen } from "../add/SelectHarvestPlotsScreen";
import { SelectHarvestQuantityScreen } from "../add/SelectHarvestQuantityScreen";
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
      key="select-harvest-date"
      name="SelectHarvestDate"
      options={{
        title: "",
      }}
      component={SelectHarvestDateScreen}
    />,
    <Stack.Screen
      key="select-harvest-crop"
      name="SelectHarvestCrop"
      options={{
        title: "",
      }}
      component={SelectHarvestCropScreen}
    />,
    <Stack.Screen
      key="select-harvesting-machinery"
      name="SelectHarvestingMachinery"
      options={{
        title: "",
      }}
      component={SelectHarvestingMachineryScreen}
    />,
    <Stack.Screen
      key="select-harvest-quantity"
      name="SelectHarvestQuantity"
      options={{
        title: "",
      }}
      component={SelectHarvestQuantityScreen}
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
