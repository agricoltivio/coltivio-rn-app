import { Stack } from "@/navigation/stack";
import { AddPlotMapScreen } from "../AddPlotMapScreen";
import { AddPlotSummaryScreen } from "../AddPlotSummaryScreen";
import { DeletePlotScreen } from "../DeletePlotScreen";
import { EditPlotMapScreen } from "../EditPlotMapScreen";
import { EditPlotScreen } from "../EditPlotScreen";
import { PlotDetailsScreen } from "../PlotDetailsScreen";
import { PlotsMapScreen } from "../PlotsMapScreen";
import { PlotsScreen } from "../PlotsScreen";
import { DefaultTheme } from "styled-components";
import { PlotTillagesScreen } from "../PlotTillagesScreen";
import { PlotCropProtectionApplicationsScreen } from "../PlotCropProtectionApllicationsScreen";
import { PlotCropProtectionApplicationsOfYearListScreen } from "../PlotCropProtectionApplicationsOfYearListScreen";
import { PlotCropProtectionApplicationsOfYearScreen } from "../PlotCropProtectionApplicationsOfYearScreen";
import { PlotFertilizerApplicationsScreen } from "../PlotFertilizerApllicationsScreen";
import { PlotFertilizerApplicationsOfYearListScreen } from "../PlotFertilizerApplicationsOfYearListScreen";
import { PlotFertilizerApplicationsOfYearScreen } from "../PlotFertilizerApplicationsOfYearScreen";
import { PlotHarvestsOfYearListScreen } from "../PlotHarvestsOfYearListScreen";
import { PlotHarvestsOfYearScreen } from "../PlotHarvestsOfYearScreen";
import { PlotHarvestsScreen } from "../PlotHarvestsScreen";
import { PlotTillagesOfYearListScreen } from "../PlotTillagesOfYearListScreen";

export function renderPlotsStack(theme: DefaultTheme) {
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
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={PlotsScreen}
    />,
    <Stack.Screen
      key="plot-details"
      name="PlotDetails"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={PlotDetailsScreen}
    />,
    <Stack.Screen
      key="plot-harvests"
      name="PlotHarvests"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={PlotHarvestsScreen}
    />,
    <Stack.Screen
      key="plot-harvests-of-year"
      name="PlotHarvestsOfYear"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={PlotHarvestsOfYearScreen}
    />,
    <Stack.Screen
      key="plot-harvests-of-year-list"
      name="PlotHarvestsOfYearList"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={PlotHarvestsOfYearListScreen}
    />,

    <Stack.Screen
      key="plot-fertilizer-applications"
      name="PlotFertilizerApplications"
      options={{ title: "" }}
      component={PlotFertilizerApplicationsScreen}
    />,
    <Stack.Screen
      key="plot-fertilizer-applications-of-year"
      name="PlotFertilizerApplicationsOfYear"
      options={{ title: "" }}
      component={PlotFertilizerApplicationsOfYearScreen}
    />,
    <Stack.Screen
      key="plot-fertilizer-applications-of-year-list"
      name="PlotFertilizerApplicationsOfYearList"
      options={{ title: "" }}
      component={PlotFertilizerApplicationsOfYearListScreen}
    />,
    <Stack.Screen
      key="plot-crop-protection-applications"
      name="PlotCropProtectionApplications"
      options={{ title: "" }}
      component={PlotCropProtectionApplicationsScreen}
    />,
    <Stack.Screen
      key="plot-crop-protection-applications-of-year"
      name="PlotCropProtectionApplicationsOfYear"
      options={{ title: "" }}
      component={PlotCropProtectionApplicationsOfYearScreen}
    />,
    <Stack.Screen
      key="plot-crop-protection-applications-of-year-list"
      name="PlotCropProtectionApplicationsOfYearList"
      options={{ title: "" }}
      component={PlotCropProtectionApplicationsOfYearListScreen}
    />,
    <Stack.Screen
      key="plot-tillages"
      name="PlotTillages"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={PlotTillagesScreen}
    />,
    <Stack.Screen
      key="plot-tillages-of-year-list"
      name="PlotTillagesOfYearList"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={PlotTillagesOfYearListScreen}
    />,
  ];
}
