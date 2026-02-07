import { Stack } from "@/navigation/stack";
import { AddCropProtectionApplicationConfigurationScreen } from "../add/AddCropProtectionApplicationConfigurationScreen";
import { AddCropProtectionApplicationDivideOnPlotsScreen } from "../add/AddCropProtectionApplicationDivideOnPlotsScreen";
import { AddCropProtectionApplicationSelectPlotsScreen } from "../add/AddCropProtectionApplicationSelectPlotsScreen";
import { AddCropProtectionApplicationSummaryScreen } from "../add/AddCropProtectionApplicationSummaryScreen";
import { CropProtectionApplicationDetailsScreen } from "../CropProtectionApplicationDetails";
import { CropProtectionApplicationsOfYearListScreen } from "../CropProtectionApplicationsListScreen";
import { CropProtectionApplicationsOfYearScreen } from "../CropProtectionApplicationsOfYearScreen";
import { CropProtectionApplicationsScreen } from "../CropProtectionApplicationsScreen";
import { AddCropProtectionApplicationAdditionalNotesScreen } from "../add/AddCropProtectionApplicationAdditionalNotesScreen";

export function renderCropProtectionApplicationStack() {
  return [
    <Stack.Screen
      key="crop-protection-applications"
      name="CropProtectionApplications"
      options={{ title: "" }}
      component={CropProtectionApplicationsScreen}
    />,
    <Stack.Screen
      key="crop-protection-applications-of-year"
      name="CropProtectionApplicationsOfYear"
      options={{ title: "" }}
      component={CropProtectionApplicationsOfYearScreen}
    />,
    <Stack.Screen
      key="crop-protection-applications-of-year-list"
      name="CropProtectionApplicationsOfYearList"
      options={{ title: "" }}
      component={CropProtectionApplicationsOfYearListScreen}
    />,
    <Stack.Screen
      key="crop-protection-application-details"
      name="CropProtectionApplicationDetails"
      options={{ title: "" }}
      component={CropProtectionApplicationDetailsScreen}
    />,
    <Stack.Screen
      key="add-crop-protection-application-configuration"
      name="AddCropProtectionApplicationConfiguration"
      options={{ title: "" }}
      component={AddCropProtectionApplicationConfigurationScreen}
    />,
    <Stack.Screen
      key="add-crop-protection-application-select-plots"
      name="AddCropProtectionApplicationSelectPlots"
      options={{ title: "", headerShown: false }}
      component={AddCropProtectionApplicationSelectPlotsScreen}
    />,
    <Stack.Screen
      key="add-crop-protection-application-divide-on-plots"
      name="AddCropProtectionApplicationDivideOnPlots"
      options={{ title: "" }}
      component={AddCropProtectionApplicationDivideOnPlotsScreen}
    />,
    <Stack.Screen
      key="add-crop-protection-application-additional-notes"
      name="AddCropProtectionApplicationAdditionalNotes"
      options={{ title: "" }}
      component={AddCropProtectionApplicationAdditionalNotesScreen}
    />,
    <Stack.Screen
      key="add-crop-protection-application-summary"
      name="AddCropProtectionApplicationSummary"
      options={{ title: "" }}
      component={AddCropProtectionApplicationSummaryScreen}
    />,
  ];
}
