import { Stack } from "@/navigation/stack";
import { ConfigureCropProtectionApplicationScreen } from "../add/ConfigureCropProtectionApplicationScreen";
import { DivideCropProtectionApplicationOnPlotsScreen } from "../add/DivideCropProtectionApplicationOnPlotsScreen";
import { SelectCropProtectionApplicationPlotsScreen } from "../add/SelectCropProtectionApplicationPlotsScreen";
import { CropProtectionApplicationSummaryScreen } from "../add/CropProtectionApplicationSummaryScreen";
import { SelectCropProtectionApplicationProductAndDateScreen } from "../add/SelectCropProtectionApplicationProductAndDateScreen";
import { SetCropProtectionApplicationUnitQuantityScreen } from "../add/SetCropProtectionApplicationUnitQuantityScreen";
import { CropProtectionApplicationDetailsScreen } from "../CropProtectionApplicationDetails";
import { CropProtectionApplicationsOfYearListScreen } from "../CropProtectionApplicationsListScreen";
import { CropProtectionApplicationsOfYearScreen } from "../CropProtectionApplicationsOfYearScreen";
import { CropProtectionApplicationsScreen } from "../CropProtectionApplicationsScreen";

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
      key="select-crop-protection-application-product-and-date"
      name="SelectCropProtectionApplicationProductAndDate"
      options={{ title: "" }}
      component={SelectCropProtectionApplicationProductAndDateScreen}
    />,
    <Stack.Screen
      key="configure-crop-protection-application"
      name="ConfigureCropProtectionApplication"
      options={{ title: "" }}
      component={ConfigureCropProtectionApplicationScreen}
    />,
    <Stack.Screen
      key="set-crop-protection-application-unit-quantity"
      name="SetCropProtectionApplicationUnitQuantity"
      options={{ title: "" }}
      component={SetCropProtectionApplicationUnitQuantityScreen}
    />,
    <Stack.Screen
      key="select-crop-protection-application-plots"
      name="SelectCropProtectionApplicationPlots"
      options={{ title: "", headerShown: false }}
      component={SelectCropProtectionApplicationPlotsScreen}
    />,
    <Stack.Screen
      key="divide-crop-protection-application-on-plots"
      name="DivideCropProtectionApplicationOnPlots"
      options={{ title: "" }}
      component={DivideCropProtectionApplicationOnPlotsScreen}
    />,
    <Stack.Screen
      key="crop-protection-application-summary"
      name="CropProtectionApplicationSummary"
      options={{ title: "" }}
      component={CropProtectionApplicationSummaryScreen}
    />,
  ];
}
