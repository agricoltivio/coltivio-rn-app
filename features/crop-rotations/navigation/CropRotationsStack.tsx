import { PlotCropRotationsScreen } from "@/features/plots/PlotCropRotationsScreen";
import { Stack } from "@/navigation/stack";
import { AddCropRotationScreen } from "../AddCropRotationScreen";
import { AddCropRotationSelectCropScreen } from "../batch/AddCropRotationSelectCropScreen";
import { AddCropRotationSelectPlotsScreen } from "../batch/AddCropRotationSelectPlotsScreen";
import { AddCropRotationSelectStartDateScreen } from "../batch/AddCropRotationSelectStartDateScreen";
import { AddCropRotationSummaryScreen } from "../batch/AddCropRotationSummaryScreen";
import { CropRotationsOfYearListScreen } from "../CropRotationsOfYearListScreen";
import { CropRotationsScreen } from "../CropRotationsScreen";
import { EditCropRotationScreen } from "../EditCropRotationScreen";
import { DefaultTheme } from "styled-components";

export function renderCropsRotationStack(theme: DefaultTheme) {
  return [
    <Stack.Screen
      key="crop-rotations"
      name="CropRotations"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={CropRotationsScreen}
    />,
    <Stack.Screen
      key="crop-rotations-of-year-list"
      name="CropRotationsOfYearList"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={CropRotationsOfYearListScreen}
    />,
    <Stack.Screen
      key="plot-crop-rotations"
      name="PlotCropRotations"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={PlotCropRotationsScreen}
    />,
    <Stack.Screen
      key="add-plot-crop-rotation"
      name="AddPlotCropRotation"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={AddCropRotationScreen}
    />,
    <Stack.Screen
      key="edit-plot-crop-rotation"
      name="EditPlotCropRotation"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={EditCropRotationScreen}
    />,
    <Stack.Screen
      key="add-crop-rotation-select-start-date"
      name="AddCropRotationSelectStartDate"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={AddCropRotationSelectStartDateScreen}
    />,
    <Stack.Screen
      key="add-crop-rotation-select-crop"
      name="AddCropRotationSelectCrop"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={AddCropRotationSelectCropScreen}
    />,
    <Stack.Screen
      key="add-crop-rotation-select-plots"
      name="AddCropRotationSelectPlots"
      options={{
        title: "",
        headerShown: false,
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={AddCropRotationSelectPlotsScreen}
    />,
    <Stack.Screen
      key="add-crop-rotation-summary"
      name="AddCropRotationSummary"
      options={{
        title: "",
        headerTitleStyle: { color: theme.colors.primary },
      }}
      component={AddCropRotationSummaryScreen}
    />,
  ];
}
