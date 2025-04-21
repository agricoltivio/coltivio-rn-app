import { Stack } from "@/navigation/stack";
import { AddCropProtectionApplicationDivideOnPlotsScreen } from "../add/AddCropProtectionApplicationDivideOnPlotsScreen";
import { AddCropProtectionApplicationSelectDateScreen } from "../add/AddCropProtectionApplicationSelectDateScreen";
import { AddCropProtectionApplicationSelectMachineConfigScreen } from "../add/AddCropProtectionApplicationSelectEquipmentScreen";
import { AddCropProtectionApplicationSelectPlotsScreen } from "../add/AddCropProtectionApplicationSelectPlotsScreen";
import { AddCropProtectionApplicationSelectProductScreen } from "../add/AddCropProtectionApplicationSelectProductScreen";
import { AddCropProtectionApplicationSelectQuantityScreen } from "../add/AddCropProtectionApplicationSelectQuantityScreen";
import { AddCropProtectionApplicationSummaryScreen } from "../add/AddCropProtectionApplicationSummaryScreen";
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
      key="add-crop-protection-application-select-date"
      name="AddCropProtectionApplicationSelectDate"
      options={{ title: "" }}
      component={AddCropProtectionApplicationSelectDateScreen}
    />,
    <Stack.Screen
      key="add-crop-protection-application-select-product"
      name="AddCropProtectionApplicationSelectProduct"
      options={{
        title: "",
      }}
      component={AddCropProtectionApplicationSelectProductScreen}
    />,
    <Stack.Screen
      key="add-crop-protection-application-select-machine-config"
      name="AddCropProtectionApplicationSelectMachineConfig"
      options={{ title: "" }}
      component={AddCropProtectionApplicationSelectMachineConfigScreen}
    />,
    <Stack.Screen
      key="add-crop-protection-application-select-quantity"
      name="AddCropProtectionApplicationSelectQuantity"
      options={{ title: "" }}
      component={AddCropProtectionApplicationSelectQuantityScreen}
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
      key="add-crop-protection-application-summary"
      name="AddCropProtectionApplicationSummary"
      options={{ title: "" }}
      component={AddCropProtectionApplicationSummaryScreen}
    />,
  ];
}
