import { Stack } from "@/navigation/stack";
import { AddPlotMapScreen } from "../AddPlotMapScreen";
import { AddPlotSummaryScreen } from "../AddPlotSummaryScreen";
import { DeletePlotScreen } from "../DeletePlotScreen";
import { EditPlotMapScreen } from "../EditPlotMapScreen";
import { EditPlotScreen } from "../EditPlotScreen";
import { PlotDetailsScreen } from "../PlotDetailsScreen";
import { PlotsMapScreen } from "../PlotsMapScreen";
import { PlotsScreen } from "../PlotsScreen";
import { PlotTillagesScreen } from "../PlotTillagesScreen";
import { PlotCropProtectionApplicationsScreen } from "../PlotCropProtectionApllicationsScreen";
import { PlotFertilizerApplicationsScreen } from "../PlotFertilizerApllicationsScreen";
import { PlotHarvestsScreen } from "../PlotHarvestsScreen";

export function renderPlotsStack() {
  return [
    <Stack.Screen
      key="plots-map"
      name="PlotsMap"
      component={PlotsMapScreen}
      options={{
        headerShown: false,
      }}
    />,
    <Stack.Screen
      key="add-plot-map"
      name="AddPlotMap"
      component={AddPlotMapScreen}
      options={{
        headerShown: false,
      }}
    />,
    <Stack.Screen
      key="add-plot-summary"
      name="AddPlotSummary"
      component={AddPlotSummaryScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="edit-plot"
      name="EditPlot"
      component={EditPlotScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="edit-plot-map"
      name="EditPlotMap"
      component={EditPlotMapScreen}
      options={{
        title: "",
        headerShown: false,
      }}
    />,
    <Stack.Screen
      key="delete-plot"
      name="DeletePlot"
      component={DeletePlotScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="plots"
      name="Plots"
      options={{
        title: "",
      }}
      component={PlotsScreen}
    />,
    <Stack.Screen
      key="plot-details"
      name="PlotDetails"
      options={{
        title: "",
      }}
      component={PlotDetailsScreen}
    />,
    <Stack.Screen
      key="plot-harvests"
      name="PlotHarvests"
      options={{
        title: "",
      }}
      component={PlotHarvestsScreen}
    />,
    <Stack.Screen
      key="plot-fertilizer-applications"
      name="PlotFertilizerApplications"
      options={{ title: "" }}
      component={PlotFertilizerApplicationsScreen}
    />,
    <Stack.Screen
      key="plot-crop-protection-applications"
      name="PlotCropProtectionApplications"
      options={{ title: "" }}
      component={PlotCropProtectionApplicationsScreen}
    />,
    <Stack.Screen
      key="plot-tillages"
      name="PlotTillages"
      options={{
        title: "",
      }}
      component={PlotTillagesScreen}
    />,
  ];
}
