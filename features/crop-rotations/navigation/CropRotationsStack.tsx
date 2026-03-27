import { Stack } from "@/navigation/stack";
import { CropRotationsOfYearListScreen } from "../CropRotationsOfYearListScreen";
import { CropRotationsScreen } from "../CropRotationsScreen";
import { EditCropRotationScreen } from "../EditCropRotationScreen";
import { PlanCropRotationsScreen } from "../plan/PlanCropRotationsScreen";
import { SelectPlotsForPlanScreen } from "../plan/SelectPlotsForPlanScreen";
import { DraftPlansScreen } from "../drafts/DraftPlansScreen";
import { DraftPlanDetailScreen } from "../drafts/DraftPlanDetailScreen";
import { CreateDraftPlanScreen } from "../drafts/CreateDraftPlanScreen";
import { AddPlotsToDraftScreen } from "../drafts/AddPlotsToDraftScreen";
import { PlanDraftRotationsScreen } from "../drafts/PlanDraftRotationsScreen";

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
        title: "",
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
    <Stack.Screen
      key="draft-plans"
      name="DraftPlans"
      options={{
        title: "",
      }}
      component={DraftPlansScreen}
    />,
    <Stack.Screen
      key="draft-plan-detail"
      name="DraftPlanDetail"
      options={{
        title: "",
      }}
      component={DraftPlanDetailScreen}
    />,
    <Stack.Screen
      key="create-draft-plan"
      name="CreateDraftPlan"
      options={{
        title: "",
      }}
      component={CreateDraftPlanScreen}
    />,
    <Stack.Screen
      key="add-plots-to-draft"
      name="AddPlotsToDraft"
      options={{ title: "" }}
      component={AddPlotsToDraftScreen}
    />,
    <Stack.Screen
      key="plan-draft-rotations"
      name="PlanDraftRotations"
      options={{
        title: "",
      }}
      component={PlanDraftRotationsScreen}
    />,
  ];
}
