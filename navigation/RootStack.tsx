import { useSession } from "@/auth/SessionProvider";
import { AgriColtivioInfoScreen } from "@/features/agri-coltivio/AgriColtivioInfoScreen";
import { renderAuthStack } from "@/features/auth/navigation/AuthStack";
import { AddCropProtectionApplicationDivideOnPlotsScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationDivideOnPlotsScreen";
import { AddCropProtectionApplicationSelectDateScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSelectDateScreen";
import { AddCropProtectionApplicationSelectMachineConfigScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSelectEquipmentScreen";
import { AddCropProtectionApplicationSelectPlotsScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSelectPlotsScreen";
import { AddCropProtectionApplicationSelectProductScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSelectProductScreen";
import { AddCropProtectionApplicationSelectQuantityScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSelectQuantityScreen";
import { AddCropProtectionApplicationSummaryScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSummaryScreen";
import { CropProtectionApplicationDetailsScreen } from "@/features/crop-protection-applications/CropProtectionApplicationDetails";
import { CropProtectionApplicationsOfYearListScreen } from "@/features/crop-protection-applications/CropProtectionApplicationsListScreen";
import { CropProtectionApplicationsOfYearScreen } from "@/features/crop-protection-applications/CropProtectionApplicationsOfYearScreen";
import { CropProtectionApplicationsScreen } from "@/features/crop-protection-applications/CropProtectionApplicationsScreen";
import { CreateCropProtectionProductScreen } from "@/features/crop-protection-products/CreateCropProtectionProductScreen";
import { CropProtectionProductsScreen } from "@/features/crop-protection-products/CropProtectionProductsScreen";
import { EditCropProtectionProductScreen } from "@/features/crop-protection-products/EditCropProtectionProductScreen";
import { AddCropRotationScreen } from "@/features/crop-rotations/AddCropRotationScreen";
import { AddCropRotationSelectCropScreen } from "@/features/crop-rotations/batch/AddCropRotationSelectCropScreen";
import { AddCropRotationSelectPlotsScreen } from "@/features/crop-rotations/batch/AddCropRotationSelectPlotsScreen";
import { AddCropRotationSelectStartDateScreen } from "@/features/crop-rotations/batch/AddCropRotationSelectStartDateScreen";
import { AddCropRotationSummaryScreen } from "@/features/crop-rotations/batch/AddCropRotationSummaryScreen";
import { CropRotationsOfYearListScreen } from "@/features/crop-rotations/CropRotationsOfYearListScreen";
import { CropRotationsScreen } from "@/features/crop-rotations/CropRotationsScreen";
import { EditCropRotationScreen } from "@/features/crop-rotations/EditCropRotationScreen";
import { CreateCropScreen } from "@/features/crops/CreateCropScreen";
import { CropsScreen } from "@/features/crops/CropsScreen";
import { EditCropScreen } from "@/features/crops/EditCropScreen";
import { CreateCropProtectionEquipmentScreen } from "@/features/equipment/CreateCropProtectionEquipmentScreen";
import { CreateFarmEquipmentScreen } from "@/features/equipment/CreateFarmEquipmentScreen";
import { CreateFertilizerSpreaderScreen } from "@/features/equipment/CreateFertilizerSpreaderScreen";
import { CreateHarvestingMachineryScreen } from "@/features/equipment/CreateHarvestMachineConfigScreen";
import { CreatetillageEquipmentScreen } from "@/features/equipment/CreateTillageEquipmentScreen";
import { EditCropProtectionEquipmentScreen } from "@/features/equipment/EditCropProtectionEquipmentScreen";
import { EditFertilizerSpreaderScreen } from "@/features/equipment/EditFertilizerSpreaderScreen";
import { EditHarvestingMachineryScreen } from "@/features/equipment/EditHarvestingMachineryScreen";
import { EditTillageEquipmentScreen } from "@/features/equipment/EditTillageEquipmentScreen";
import { MachineConfigsScreen } from "@/features/equipment/FarmEquipmentScreen";
import { renderErrorStack } from "@/features/errors/navigation/ErrorStack";
import {
  renderFarmModalStack,
  renderFarmStack,
} from "@/features/farms/navigation/FarmStack";
import { AddFertilizerApplicationSelectQuantityScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicaationSelectQuantityScreen";
import { AddFertilizerApplicationDivideOnPlotsScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationDivideOnPlotsScreen";
import { AddFertilizerApplicationSelectDateScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationSelectDateScreen";
import { AddFertilizerApplicationSelectFertilizerScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationSelectFertilizerScreen";
import { AddFertilizerApplicationSelectPlotsScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationSelectPlotsScreen";
import { AddFertilizerApplicationSelectSpreaderScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationSelectSpreaderScreen";
import { AddFertilizerApplicationSummaryScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationSummaryScreen";
import { FertilizerApplicationDetailsScreen } from "@/features/fertilizer-application/FertilizerApplicationDetails";
import { FertilizerApplicationsOfYearListScreen } from "@/features/fertilizer-application/FertilizerApplicationsListScreen";
import { FertilizerApplicationsOfYearScreen } from "@/features/fertilizer-application/FertilizerApplicationsOfYearScreen";
import { FertilizerApplicationsScreen } from "@/features/fertilizer-application/FertilizerApplicationsScreen";
import { CreateFertilizerScreen } from "@/features/fertilizers/CreateFertilizerScreen";
import { EditFertilizerScreen } from "@/features/fertilizers/EditFertilizerScreen";
import { FertilizersScreen } from "@/features/fertilizers/FertilizersScreen";
import { FieldCalendarScreen } from "@/features/field-calendar/FieldCalendarScreen";
import { DivideHarvestOnPlotsScreen } from "@/features/harvests/add/DivideHarvestOnPlotsScreen";
import { HarvestSummaryScreen } from "@/features/harvests/add/HarvestSummaryScreen";
import { SelectHarvestCropScreen } from "@/features/harvests/add/SelectHarvestCropScreen";
import { SelectHarvestDateScreen } from "@/features/harvests/add/SelectHarvestDateScreen";
import { SelectHarvestingMachineryScreen } from "@/features/harvests/add/SelectHarvestingMachineryScreen";
import { SelectHarvestPlotsScreen } from "@/features/harvests/add/SelectHarvestPlotsScreen";
import { SelectHarvestQuantityScreen } from "@/features/harvests/add/SelectHarvestQuantityScreen";
import { HarvestDetailsScreen } from "@/features/harvests/HarvestDetailsScreen";
import { HarvestListScreen } from "@/features/harvests/HarvestListScreen";
import { HarvestsOfYearScreen } from "@/features/harvests/HarvestOfYearScreen";
import { HarvestsScreen } from "@/features/harvests/HarvestsScreen";
import { renderHomeStack } from "@/features/home/navigation/HomeStack";
import { AddPlotMapScreen } from "@/features/plots/AddPlotMapScreen";
import { AddPlotSummaryScreen } from "@/features/plots/AddPlotSummaryScreen";
import { DeletePlotScreen } from "@/features/plots/DeletePlotScreen";
import { EditPlotMapScreen } from "@/features/plots/EditPlotMapScreen";
import { EditPlotScreen } from "@/features/plots/EditPlotScreen";
import { PlotCropProtectionApplicationsScreen } from "@/features/plots/PlotCropProtectionApllicationsScreen";
import { PlotCropProtectionApplicationsOfYearListScreen } from "@/features/plots/PlotCropProtectionApplicationsOfYearListScreen";
import { PlotCropProtectionApplicationsOfYearScreen } from "@/features/plots/PlotCropProtectionApplicationsOfYearScreen";
import { PlotCropRotationsScreen } from "@/features/plots/PlotCropRotationsScreen";
import { PlotDetailsScreen } from "@/features/plots/PlotDetailsScreen";
import { PlotFertilizerApplicationsScreen } from "@/features/plots/PlotFertilizerApllicationsScreen";
import { PlotFertilizerApplicationsOfYearListScreen } from "@/features/plots/PlotFertilizerApplicationsOfYearListScreen";
import { PlotFertilizerApplicationsOfYearScreen } from "@/features/plots/PlotFertilizerApplicationsOfYearScreen";
import { PlotHarvestsOfYearListScreen } from "@/features/plots/PlotHarvestsOfYearListScreen";
import { PlotHarvestsOfYearScreen } from "@/features/plots/PlotHarvestsOfYearScreen";
import { PlotHarvestsScreen } from "@/features/plots/PlotHarvestsScreen";
import { PlotsMapScreen } from "@/features/plots/PlotsMapScreen";
import { PlotsScreen } from "@/features/plots/PlotsScreen";
import { PlotTillagesOfYearListScreen } from "@/features/plots/PlotTillagesOfYearListScreen";
import { PlotTillagesScreen } from "@/features/plots/PlotTillagesScreen";
import { FieldCalendarExportScreen } from "@/features/field-calendar/FieldCalendarExportScreen";
import { FieldCalendarExportSuccessScreen } from "@/features/field-calendar/FieldCalendarExportSuccessScreen";
import { AddTillageSelectDateScreen } from "@/features/tillages/add/AddTillageSelectDateScreen";
import { AddTillageSelectEquipmentScreen } from "@/features/tillages/add/AddTillageSelectEquipmentScreen";
import { AddTillageSelectPlotsScreen } from "@/features/tillages/add/AddTillageSelectPlotsScreen";
import { AddTillageSummaryScreen } from "@/features/tillages/add/AddTillageSummaryScreen";
import { TillageDetailsScreen } from "@/features/tillages/TillageDetails";
import { TillagesOfYearListScreen } from "@/features/tillages/TillagesOfYearListScreen";
import { TillagesScreen } from "@/features/tillages/TillagesScreen";
import { renderUserStack } from "@/features/user/navigation/UserStack";
import { useUserQuery } from "@/features/user/users.hooks";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components/native";
import { renderOnboardingStack } from "../features/onboarding/navigation/OnboardingStack";
import { Stack } from "./stack";
import { renderPlotsStack } from "@/features/plots/navigation/PlotsStack";
import { renderCropsRotationStack } from "@/features/crop-rotations/navigation/CropRotationsStack";
import { renderTillagesStack } from "@/features/tillages/navigation/TillagesStack";
import { renderEquipmentStack } from "@/features/equipment/navigation/EquipmentStack";
import { renderFieldCalendarStack } from "@/features/field-calendar/navigation/FieldCalendarStack";
import { renderCropsStack } from "@/features/crops/navigation/CropsStack";
import { renderHarvestStack } from "@/features/harvests/navigation/HarvestStack";
import { renderFertilizerStack } from "@/features/fertilizers/navigation/FertilizerStack";
import { renderFertilizerApplicationStack } from "@/features/fertilizer-application/navigation/FertilizerApplicationStack";
import { renderCropProtectionApplicationStack } from "@/features/crop-protection-applications/navigation/CropProtectionApplicationStack";
import { renderCropProtectionProductStack } from "@/features/crop-protection-products/navigation/CropProtectionProductStack";
import { renderAgriColtivioStack } from "@/features/agri-coltivio/navigation/AgriColtivioStack";

SplashScreen.preventAutoHideAsync();

export function RootStack() {
  const { loadingFromStorage, token } = useSession();
  const theme = useTheme();
  const [splashScreenVisible, setSplashScreenVisible] = useState(true);
  const navigation = useNavigation();
  const {
    user,
    isFetched: userFetched,
    isFetching,
    error,
  } = useUserQuery(token != null);

  const hasFarm = user?.farmId != null;

  useEffect(() => {
    if (!splashScreenVisible || loadingFromStorage) {
      return;
    }
    if (token) {
      if (!userFetched) {
        return;
      }
    }
    // hide the splash screen after the token has been loaded
    SplashScreen.hideAsync();
    setSplashScreenVisible(false);
  }, [loadingFromStorage, userFetched]);

  if (loadingFromStorage) {
    return null;
  }
  if (token && !userFetched) {
    return null;
  }
  function renderStacks() {
    // in case no token is available, render the sign in screen
    if (!token) {
      return renderAuthStack(theme);
    }
    if (error || (!user && isFetching)) {
      if (error) {
        console.error(error);
      }
      return renderErrorStack(theme);
    }

    if (!hasFarm) {
      return renderOnboardingStack(theme);
    }

    return (
      <>
        <Stack.Group>
          {renderHomeStack(theme, navigation)}
          {renderUserStack()}
          {renderFarmStack()}
          {renderPlotsStack(theme)}
          {renderCropsRotationStack(theme)}
          {renderTillagesStack(theme)}
          {renderEquipmentStack()}
          {renderFieldCalendarStack(theme, navigation)}
          {renderCropsStack()}
          {renderHarvestStack()}
          {renderFertilizerStack()}
          {renderFertilizerApplicationStack()}
          {renderCropProtectionApplicationStack()}
          {renderCropProtectionProductStack()}
          {renderAgriColtivioStack()}
        </Stack.Group>

        <Stack.Group
          screenOptions={{
            presentation: "modal",
            headerTitle: "",
            contentStyle: {
              backgroundColor: theme.colors.gray5,
            },
          }}
        >
          {renderFarmModalStack()}
        </Stack.Group>
      </>
    );
  }
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.primary,
        headerBackButtonDisplayMode: "minimal",
        headerTitleStyle: { color: theme.colors.primary },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerShadowVisible: false,
      }}
    >
      {renderStacks()}
    </Stack.Navigator>
  );
}
