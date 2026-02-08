import { PlotCropRotationsScreen } from "@/features/plots/PlotCropRotationsScreen";
import { Stack } from "@/navigation/stack";
import { CropRotationsOfYearListScreen } from "../CropRotationsOfYearListScreen";
import { CropRotationsScreen } from "../CropRotationsScreen";
import { EditCropRotationScreen } from "../EditCropRotationScreen";
import { PlanCropRotationsScreen } from "../plan/PlanCropRotationsScreen";
import { SelectPlotsForPlanScreen } from "../plan/SelectPlotsForPlanScreen";

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
      key="edit-plot-crop-rotation"
      name="EditPlotCropRotation"
      options={{
        title: "",
      }}
      component={EditCropRotationScreen}
    />,
    <Stack.Screen
      key="plan-crop-rotations"
      name="PlanCropRotations"
      options={{
        title: "Plan Crop Rotations",
      }}
      component={PlanCropRotationsScreen}
    />,
    <Stack.Screen
      key="select-plots-for-plan"
      name="SelectPlotsForPlan"
      options={{
        title: "",
        headerShown: false,
      }}
      component={SelectPlotsForPlanScreen}
    />,
  ];
}
