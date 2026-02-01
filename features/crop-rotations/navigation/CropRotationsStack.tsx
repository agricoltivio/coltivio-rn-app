import { PlotCropRotationsScreen } from "@/features/plots/PlotCropRotationsScreen";
import { Stack } from "@/navigation/stack";
import { AddCropRotationScreen } from "../AddCropRotationScreen";
import { AddCropRotationSelectCropScreen } from "../batch/AddCropRotationSelectCropScreen";
import { AddCropRotationSelectPlotsScreen } from "../batch/AddCropRotationSelectPlotsScreen";
import { AddCropRotationSummaryScreen } from "../batch/AddCropRotationSummaryScreen";
import { CropRotationsOfYearListScreen } from "../CropRotationsOfYearListScreen";
import { CropRotationsScreen } from "../CropRotationsScreen";
import { EditCropRotationScreen } from "../EditCropRotationScreen";
import { DefaultTheme } from "styled-components";

export function renderCropsRotationStack() {
  return [
    <Stack.Screen
      key="crop-rotations"
      name="CropRotations"
      options={{
        title: "",
      }}
      component={CropRotationsScreen}
    />,
    <Stack.Screen
      key="crop-rotations-of-year-list"
      name="CropRotationsOfYearList"
      options={{
        title: "",
      }}
      component={CropRotationsOfYearListScreen}
    />,
    <Stack.Screen
      key="plot-crop-rotations"
      name="PlotCropRotations"
      options={{
        title: "",
      }}
      component={PlotCropRotationsScreen}
    />,
    <Stack.Screen
      key="add-plot-crop-rotation"
      name="AddPlotCropRotation"
      options={{
        title: "",
      }}
      component={AddCropRotationScreen}
    />,
    <Stack.Screen
      key="edit-plot-crop-rotation"
      name="EditPlotCropRotation"
      options={{
        title: "",
      }}
      component={EditCropRotationScreen}
    />,
    <Stack.Screen
      key="add-crop-rotation-select-crop"
      name="AddCropRotationSelectCrop"
      options={{
        title: "",
      }}
      component={AddCropRotationSelectCropScreen}
    />,
    <Stack.Screen
      key="add-crop-rotation-select-plots"
      name="AddCropRotationSelectPlots"
      options={{
        title: "",
        headerShown: false,
      }}
      component={AddCropRotationSelectPlotsScreen}
    />,
    <Stack.Screen
      key="add-crop-rotation-summary"
      name="AddCropRotationSummary"
      options={{
        title: "",
      }}
      component={AddCropRotationSummaryScreen}
    />,
  ];
}
