import { useSession } from "@/auth/SessionProvider";
import { SignInScreen } from "@/features/auth/SignInScreen";
import { SignUpScreen } from "@/features/auth/SignUpScreen";
import { CreateCropScreen } from "@/features/crops/CreateCropScreen";
import { CropsScreen } from "@/features/crops/CropsScreen";
import { EditCropScreen } from "@/features/crops/EditCropScreen";
import { UnexpectedErrorScreen } from "@/features/errors/UnexpectedErrorScreen";
import { DeleteFarmScreen } from "@/features/farms/DeleteFarmScreen";
import { EditFarmLocationScreen } from "@/features/farms/EditFarmLocationScreen";
import { EditFarmNameScreen } from "@/features/farms/EditFarmNameScreen";
import { FarmScreen } from "@/features/farms/FarmScreen";
import { SearchFarmLocationModal } from "@/features/farms/SearchFarmLocationModal";
import { AddFertilizerApplicationSelectQuantityScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicaationSelectQuantityScreen";
import { AddFertilizerApplicationDivideOnPlotsScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationDivideOnPlotsScreen";
import { AddFertilizerApplicationSelectDateScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationSelectDateScreen";
import { AddFertilizerApplicationSelectFertilizerScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationSelectFertilizerScreen";
import { AddFertilizerApplicationSelectSpreaderScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationSelectSpreaderScreen";
import { AddFertilizerApplicationSelectPlotsScreen } from "@/features/fertilizer-application/add/AddFertilizerApplicationSelectPlotsScreen";
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
import { HomeScreen } from "@/features/home/HomeScreen";
import { CreateFarmEquipmentScreen } from "@/features/equipment/CreateFarmEquipmentScreen";
import { EditFertilizerSpreaderScreen } from "@/features/equipment/EditFertilizerSpreaderScreen";
import { EditHarvestingMachineryScreen } from "@/features/equipment/EditHarvestingMachineryScreen";
import { MachineConfigsScreen } from "@/features/equipment/FarmEquipmentScreen";
import { FarmSummaryScreen } from "@/features/onboarding/FarmSummaryScreen";
import { SelectCropsScreen } from "@/features/onboarding/SelectCropsScreen";
import { SelectFarmLocationScreen } from "@/features/onboarding/SelectFarmLocationScreen";
import { SelectFarmLocationSearchModal } from "@/features/onboarding/SelectFarmLocationSearchModal";
import { SelectFarmNameScreen } from "@/features/onboarding/SelectFarmNameScreen";
import { SelectFederalFarmIdMapScreen } from "@/features/onboarding/SelectFederalFarmIdMapScreen";
import { SelectFederalFarmIdScreen } from "@/features/onboarding/SelectFederalFarmIdScreen";
import { SelectFertilizersScreen } from "@/features/onboarding/SelectFertilizersScreen";
import { SelectParcelsMapScreen } from "@/features/onboarding/SelectParcelsMapScreen";
import { SelectParcelsScreen } from "@/features/onboarding/SelectParcelsScreen";
import { SelectPlotsScreens } from "@/features/onboarding/SelectPlotsScreen";
import { AddPlotMapScreen } from "@/features/plots/AddPlotMapScreen";
import { AddPlotSummaryScreen } from "@/features/plots/AddPlotSummaryScreen";
import { AddCropRotationScreen } from "@/features/crop-rotations/AddCropRotationScreen";
import { DeletePlotScreen } from "@/features/plots/DeletePlotScreen";
import { EditCropRotationScreen } from "@/features/crop-rotations/EditCropRotationScreen";
import { EditPlotMapScreen } from "@/features/plots/EditPlotMapScreen";
import { EditPlotScreen } from "@/features/plots/EditPlotScreen";
import { PlotCropRotationsScreen } from "@/features/plots/PlotCropRotationsScreen";
import { PlotDetailsScreen } from "@/features/plots/PlotDetailsScreen";
import { PlotFertilizerApplicationsScreen } from "@/features/plots/PlotFertilizerApllicationsScreen";
import { PlotHarvestsOfYearListScreen } from "@/features/plots/PlotHarvestsOfYearListScreen";
import { PlotHarvestsScreen } from "@/features/plots/PlotHarvestsScreen";
import { PlotsMapScreen } from "@/features/plots/PlotsMapScreen";
import { PlotsScreen } from "@/features/plots/PlotsScreen";
import { ChangeEmailScreen } from "@/features/user/ChangeEmailScreen";
import { ChangePasswordScren } from "@/features/user/ChangePasswordScreen";
import { ChangeUserNameScreen } from "@/features/user/ChangeUserNameScreen";
import { UserAccountScreen } from "@/features/user/UserAccountScreen";
import { useUserQuery } from "@/features/user/users.hooks";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components/native";
import { RootStackParamList } from "./rootStackTypes";
import { CreateFertilizerSpreaderScreen } from "@/features/equipment/CreateFertilizerSpreaderScreen";
import { AddCropRotationSelectStartDateScreen } from "@/features/crop-rotations/batch/AddCropRotationSelectStartDateScreen";
import { AddCropRotationSelectCropScreen } from "@/features/crop-rotations/batch/AddCropRotationSelectCropScreen";
import { AddCropRotationSelectPlotsScreen } from "@/features/crop-rotations/batch/AddCropRotationSelectPlotsScreen";
import { AddCropRotationSummaryScreen } from "@/features/crop-rotations/batch/AddCropRotationSummaryScreen";
import { AddTillageSelectDateScreen } from "@/features/tillages/add/AddTillageSelectDateScreen";
import { AddTillageSelectEquipmentScreen } from "@/features/tillages/add/AddTillageSelectEquipmentScreen";
import { AddTillageSelectPlotsScreen } from "@/features/tillages/add/AddTillageSelectPlotsScreen";
import { AddTillageSummaryScreen } from "@/features/tillages/add/AddTillageSummaryScreen";
import { TillagesScreen } from "@/features/tillages/TillagesScreen";
import { CreateHarvestingMachineryScreen } from "@/features/equipment/CreateHarvestMachineConfigScreen";
import { TillagesOfYearListScreen } from "@/features/tillages/TillagesOfYearListScreen";
import { PlotTillagesScreen } from "@/features/plots/PlotTillagesScreen";
import { PlotTillagesOfYearListScreen } from "@/features/plots/PlotTillagesOfYearListScreen";
import { TillageDetailsScreen } from "@/features/tillages/TillageDetails";
import { PlotFertilizerApplicationsOfYearListScreen } from "@/features/plots/PlotFertilizerApplicationsOfYearListScreen";
import { PlotFertilizerApplicationsOfYearScreen } from "@/features/plots/PlotFertilizerApplicationsOfYearScreen";
import { PlotHarvestsOfYearScreen } from "@/features/plots/PlotHarvestsOfYearScreen";
import { CropProtectionProductsScreen } from "@/features/crop-protection-products/CropProtectionProductsScreen";
import { CreateCropProtectionProductScreen } from "@/features/crop-protection-products/CreateCropProtectionProductScreen";
import { EditCropProtectionProductScreen } from "@/features/crop-protection-products/EditCropProtectionProductScreen";
import { AddCropProtectionApplicationSelectQuantityScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSelectQuantityScreen";
import { AddCropProtectionApplicationDivideOnPlotsScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationDivideOnPlotsScreen";
import { AddCropProtectionApplicationSelectDateScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSelectDateScreen";
import { AddCropProtectionApplicationSelectMachineConfigScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSelectEquipmentScreen";
import { AddCropProtectionApplicationSelectPlotsScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSelectPlotsScreen";
import { AddCropProtectionApplicationSelectProductScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSelectProductScreen";
import { AddCropProtectionApplicationSummaryScreen } from "@/features/crop-protection-applications/add/AddCropProtectionApplicationSummaryScreen";
import { CropProtectionApplicationDetailsScreen } from "@/features/crop-protection-applications/CropProtectionApplicationDetails";
import { CropProtectionApplicationsOfYearListScreen } from "@/features/crop-protection-applications/CropProtectionApplicationsListScreen";
import { CropProtectionApplicationsOfYearScreen } from "@/features/crop-protection-applications/CropProtectionApplicationsOfYearScreen";
import { CropProtectionApplicationsScreen } from "@/features/crop-protection-applications/CropProtectionApplicationsScreen";
import { CreateCropProtectionEquipmentScreen } from "@/features/equipment/CreateCropProtectionEquipmentScreen";
import { EditCropProtectionEquipmentScreen } from "@/features/equipment/EditCropProtectionEquipmentScreen";
import { CreatetillageEquipmentScreen } from "@/features/equipment/CreateTillageEquipmentScreen";
import { EditTillageEquipmentScreen } from "@/features/equipment/EditTillageEquipmentScreen";
import { CropRotationsScreen } from "@/features/crop-rotations/CropRotationsScreen";
import { CropRotationsOfYearListScreen } from "@/features/crop-rotations/CropRotationsOfYearListScreen";
import { PlotCropProtectionApplicationsScreen } from "@/features/plots/PlotCropProtectionApllicationsScreen";
import { PlotCropProtectionApplicationsOfYearListScreen } from "@/features/plots/PlotCropProtectionApplicationsOfYearListScreen";
import { PlotCropProtectionApplicationsOfYearScreen } from "@/features/plots/PlotCropProtectionApplicationsOfYearScreen";
import { FieldCalendarExportScreen } from "@/features/reports/FieldCalendarExportScreen";
import { FieldCalendarExportSuccessScreen } from "@/features/reports/FieldCalendarExportSuccessScreen";
import { ForgotPasswordScreen } from "@/features/auth/ForgotPasswordScreen";
import { PasswordResetLinkSentScreen } from "@/features/auth/PasswordResetLinkSentScreen";
import { ResetPasswordScreen } from "@/features/auth/ResetPasswordScreen";
import { AgriColtivioInfoScreen } from "@/features/agri-coltivio/AgriColtivioInfoScreen";

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  const { loadingFromStorage, token, clearSession, authUser } = useSession();
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
    // if (!isLoading && !isFetchingUserFarms && !isFetchingUser) {
    // hide the splash screen after the token has been loaded
    SplashScreen.hideAsync();
    setSplashScreenVisible(false);
    // }
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
      return (
        <Stack.Group>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{
              headerShown: true,
              title: "",
              headerStyle: { backgroundColor: theme.colors.background },
            }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{
              headerShown: true,
              title: "",
              headerStyle: { backgroundColor: theme.colors.background },
            }}
          />
          <Stack.Screen
            name="PasswordResetLinkSent"
            component={PasswordResetLinkSentScreen}
            options={{
              headerShown: true,
              title: "",
              headerStyle: { backgroundColor: theme.colors.background },
            }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{
              headerShown: true,
              title: "",
              headerStyle: { backgroundColor: theme.colors.background },
            }}
          />
        </Stack.Group>
      );
    }
    if (error || (!user && isFetching)) {
      if (error) {
        console.error(error);
      }
      return (
        <Stack.Screen
          name="UnexpectedError"
          component={UnexpectedErrorScreen}
          options={{
            headerShown: true,
            title: "",
            headerStyle: { backgroundColor: theme.colors.background },
          }}
        />
      );
    }

    // if there is no user present, render the user onboarding

    // if the user has no farms, render the farm creation onboarding
    if (!hasFarm) {
      return (
        <>
          <Stack.Group>
            <Stack.Screen
              name="SelectFarmName"
              component={SelectFarmNameScreen}
              options={{ title: "", headerShown: false }}
            />
            <Stack.Screen
              name="SelectFarmLocation"
              component={SelectFarmLocationScreen}
              options={{ title: "", headerShown: false }}
            />
            <Stack.Screen
              name="SelectFederalFarmId"
              component={SelectFederalFarmIdScreen}
              options={{ title: "", headerShown: false }}
            />
            <Stack.Screen
              name="SelectFederalFarmIdMap"
              component={SelectFederalFarmIdMapScreen}
              options={{
                animation: "fade",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="SelectParcels"
              component={SelectParcelsScreen}
              options={{ title: "", headerShown: false }}
            />
            <Stack.Screen
              name="SelectParcelsMap"
              component={SelectParcelsMapScreen}
              options={{
                // animation: "fade",
                headerShown: false,
                // title: "Parzellen",
              }}
            />
            <Stack.Screen
              name="SelectPlots"
              component={SelectPlotsScreens}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="SelectCrops"
              component={SelectCropsScreen}
              options={{ title: "", headerShown: false }}
            />
            <Stack.Screen
              name="SelectFertilizers"
              component={SelectFertilizersScreen}
              options={{ title: "", headerShown: false }}
            />
            <Stack.Screen
              name="FarmSummary"
              component={FarmSummaryScreen}
              options={{ title: "", headerShown: false }}
            />
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
            <Stack.Screen
              name="SelectFarmLocationSearch"
              options={{ title: "", headerShown: false }}
              component={SelectFarmLocationSearchModal}
            />
          </Stack.Group>
          {/* <Stack.Group screenOptions={{ presentation: "modal" }}>
            <Stack.Screen
              name="OnboardingStep4Modal"
              component={Step4ListModal}
              options={{
                headerShown: false,
              }}
            />
          </Stack.Group> */}
        </>
      );
    }

    return (
      <>
        <Stack.Group>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: "",

              headerRight(props) {
                return (
                  <Ionicons
                    size={35}
                    name="person-circle-outline"
                    color={theme.colors.primary}
                    onPress={() => navigation.navigate("UserAccount")}
                  />
                );
              },
            }}
          />
          <Stack.Screen
            name="UserAccount"
            component={UserAccountScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="ChangeUserName"
            component={ChangeUserNameScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="ChangeEmail"
            component={ChangeEmailScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScren}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="Farm"
            component={FarmScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="EditFarmName"
            component={EditFarmNameScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="EditFarmLocation"
            component={EditFarmLocationScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="DeleteFarm"
            component={DeleteFarmScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="PlotsMap"
            component={PlotsMapScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AddPlotMap"
            component={AddPlotMapScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="AddPlotSummary"
            component={AddPlotSummaryScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="EditPlot"
            component={EditPlotScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="EditPlotMap"
            component={EditPlotMapScreen}
            options={{
              title: "",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="DeletePlot"
            component={DeletePlotScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="Plots"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={PlotsScreen}
          />
          <Stack.Screen
            name="PlotDetails"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={PlotDetailsScreen}
          />
          <Stack.Screen
            name="CropRotations"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={CropRotationsScreen}
          />
          <Stack.Screen
            name="CropRotationsOfYearList"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={CropRotationsOfYearListScreen}
          />
          <Stack.Screen
            name="PlotCropRotations"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={PlotCropRotationsScreen}
          />
          <Stack.Screen
            name="AddPlotCropRotation"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddCropRotationScreen}
          />
          <Stack.Screen
            name="EditPlotCropRotation"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={EditCropRotationScreen}
          />
          <Stack.Screen
            name="AddCropRotationSelectStartDate"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddCropRotationSelectStartDateScreen}
          />
          <Stack.Screen
            name="AddCropRotationSelectCrop"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddCropRotationSelectCropScreen}
          />
          <Stack.Screen
            name="AddCropRotationSelectPlots"
            options={{
              title: "",
              headerShown: false,
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddCropRotationSelectPlotsScreen}
          />
          <Stack.Screen
            name="AddCropRotationSummary"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddCropRotationSummaryScreen}
          />
          <Stack.Screen
            name="Tillages"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={TillagesScreen}
          />
          <Stack.Screen
            name="TillagesOfYearList"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={TillagesOfYearListScreen}
          />
          <Stack.Screen
            name="TillageDetails"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={TillageDetailsScreen}
          />
          <Stack.Screen
            name="AddTillageSelectDate"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddTillageSelectDateScreen}
          />
          <Stack.Screen
            name="AddTillageSelectEquipment"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddTillageSelectEquipmentScreen}
          />
          <Stack.Screen
            name="AddTillageSelectPlots"
            options={{
              title: "",
              headerShown: false,
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddTillageSelectPlotsScreen}
          />
          <Stack.Screen
            name="AddTillageSummary"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddTillageSummaryScreen}
          />
          <Stack.Screen
            name="PlotHarvests"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={PlotHarvestsScreen}
          />
          <Stack.Screen
            name="PlotHarvestsOfYear"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={PlotHarvestsOfYearScreen}
          />
          <Stack.Screen
            name="PlotHarvestsOfYearList"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={PlotHarvestsOfYearListScreen}
          />

          <Stack.Screen
            name="PlotFertilizerApplications"
            options={{ title: "" }}
            component={PlotFertilizerApplicationsScreen}
          />
          <Stack.Screen
            name="PlotFertilizerApplicationsOfYear"
            options={{ title: "" }}
            component={PlotFertilizerApplicationsOfYearScreen}
          />
          <Stack.Screen
            name="PlotFertilizerApplicationsOfYearList"
            options={{ title: "" }}
            component={PlotFertilizerApplicationsOfYearListScreen}
          />

          <Stack.Screen
            name="PlotCropProtectionApplications"
            options={{ title: "" }}
            component={PlotCropProtectionApplicationsScreen}
          />
          <Stack.Screen
            name="PlotCropProtectionApplicationsOfYear"
            options={{ title: "" }}
            component={PlotCropProtectionApplicationsOfYearScreen}
          />
          <Stack.Screen
            name="PlotCropProtectionApplicationsOfYearList"
            options={{ title: "" }}
            component={PlotCropProtectionApplicationsOfYearListScreen}
          />

          <Stack.Screen
            name="PlotTillages"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={PlotTillagesScreen}
          />
          <Stack.Screen
            name="PlotTillagesOfYearList"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={PlotTillagesOfYearListScreen}
          />
          <Stack.Screen
            name="MachineConfigs"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={MachineConfigsScreen}
          />
          <Stack.Screen
            name="CreateFarmEquipment"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={CreateFarmEquipmentScreen}
          />
          <Stack.Screen
            name="CreateHarvestingMachinery"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={CreateHarvestingMachineryScreen}
          />
          <Stack.Screen
            name="EditHarvestingMachinery"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={EditHarvestingMachineryScreen}
          />
          <Stack.Screen
            name="CreateFertilizerSpreader"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={CreateFertilizerSpreaderScreen}
          />
          <Stack.Screen
            name="EditFertilizerSpreader"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={EditFertilizerSpreaderScreen}
          />
          <Stack.Screen
            name="CreateCropProtectionEquipment"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={CreateCropProtectionEquipmentScreen}
          />
          <Stack.Screen
            name="EditCropProtectionEquipment"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={EditCropProtectionEquipmentScreen}
          />
          <Stack.Screen
            name="CreateTillageEquipment"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={CreatetillageEquipmentScreen}
          />
          <Stack.Screen
            name="EditTillageEquipment"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={EditTillageEquipmentScreen}
          />
          <Stack.Screen
            name="FieldCalendar"
            options={{
              title: "",
            }}
            component={FieldCalendarScreen}
          />

          <Stack.Screen
            name="FieldCalendarExport"
            options={{
              title: "",
            }}
            component={FieldCalendarExportScreen}
          />
          <Stack.Screen
            name="FieldCalendarExportSuccess"
            options={{
              title: "",
            }}
            component={FieldCalendarExportSuccessScreen}
          />
          <Stack.Screen
            name="Crops"
            options={{
              title: "",
            }}
            component={CropsScreen}
          />
          <Stack.Screen
            name="CreateCrop"
            options={{
              title: "",
            }}
            component={CreateCropScreen}
          />
          <Stack.Screen
            name="EditCrop"
            options={{
              title: "",
            }}
            component={EditCropScreen}
          />
          <Stack.Screen
            name="Harvests"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={HarvestsScreen}
          />
          <Stack.Screen
            name="HarvestsOfYear"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={HarvestsOfYearScreen}
          />
          <Stack.Screen
            name="HarvestDetails"
            component={HarvestDetailsScreen}
            options={{ title: "" }}
          />
          <Stack.Screen
            name="SelectHarvestDate"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={SelectHarvestDateScreen}
          />
          <Stack.Screen
            name="SelectHarvestCrop"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={SelectHarvestCropScreen}
          />
          <Stack.Screen
            name="SelectHarvestingMachinery"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={SelectHarvestingMachineryScreen}
          />
          <Stack.Screen
            name="SelectHarvestQuantity"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={SelectHarvestQuantityScreen}
          />
          <Stack.Screen
            name="SelectHarvstPlots"
            options={{
              title: "Ernte Fläche",
              headerShown: false,
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={SelectHarvestPlotsScreen}
          />
          <Stack.Screen
            name="DivideHarvestOnPlots"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={DivideHarvestOnPlotsScreen}
          />
          <Stack.Screen
            name="HarvestSummary"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={HarvestSummaryScreen}
          />
          <Stack.Screen
            name="HarvestsOfYearList"
            component={HarvestListScreen}
            options={{
              title: "",
            }}
          />
          <Stack.Screen
            name="Fertilizers"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={FertilizersScreen}
          />
          <Stack.Screen
            name="CreateFertilizer"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={CreateFertilizerScreen}
          />
          <Stack.Screen
            name="EditFertilizer"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={EditFertilizerScreen}
          />
          <Stack.Screen
            name="FertilizerApplications"
            options={{ title: "" }}
            component={FertilizerApplicationsScreen}
          />
          <Stack.Screen
            name="FertilizerApplicationsOfYear"
            options={{ title: "" }}
            component={FertilizerApplicationsOfYearScreen}
          />
          <Stack.Screen
            name="FertilizerApplicationsOfYearList"
            options={{ title: "" }}
            component={FertilizerApplicationsOfYearListScreen}
          />
          <Stack.Screen
            name="FertilizerApplicationDetails"
            options={{ title: "" }}
            component={FertilizerApplicationDetailsScreen}
          />
          <Stack.Screen
            name="AddFertilizerApplicationSelectDate"
            options={{ title: "" }}
            component={AddFertilizerApplicationSelectDateScreen}
          />
          <Stack.Screen
            name="AddFertilizerApplicationSelectFertilizer"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddFertilizerApplicationSelectFertilizerScreen}
          />
          <Stack.Screen
            name="AddFertilizerApplicationSelectSpreader"
            options={{ title: "" }}
            component={AddFertilizerApplicationSelectSpreaderScreen}
          />
          <Stack.Screen
            name="AddFertilizerApplicationSelectQuantity"
            options={{ title: "" }}
            component={AddFertilizerApplicationSelectQuantityScreen}
          />
          <Stack.Screen
            name="AddFertilizerApplicationSelectPlots"
            options={{ title: "", headerShown: false }}
            component={AddFertilizerApplicationSelectPlotsScreen}
          />
          <Stack.Screen
            name="AddFertilizerApplicationDivideOnPlots"
            options={{ title: "" }}
            component={AddFertilizerApplicationDivideOnPlotsScreen}
          />
          <Stack.Screen
            name="AddFertilizerApplicationSummary"
            options={{ title: "" }}
            component={AddFertilizerApplicationSummaryScreen}
          />

          <Stack.Screen
            name="CropProtectionApplications"
            options={{ title: "" }}
            component={CropProtectionApplicationsScreen}
          />
          <Stack.Screen
            name="CropProtectionApplicationsOfYear"
            options={{ title: "" }}
            component={CropProtectionApplicationsOfYearScreen}
          />
          <Stack.Screen
            name="CropProtectionApplicationsOfYearList"
            options={{ title: "" }}
            component={CropProtectionApplicationsOfYearListScreen}
          />
          <Stack.Screen
            name="CropProtectionApplicationDetails"
            options={{ title: "" }}
            component={CropProtectionApplicationDetailsScreen}
          />
          <Stack.Screen
            name="AddCropProtectionApplicationSelectDate"
            options={{ title: "" }}
            component={AddCropProtectionApplicationSelectDateScreen}
          />
          <Stack.Screen
            name="AddCropProtectionApplicationSelectProduct"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AddCropProtectionApplicationSelectProductScreen}
          />
          <Stack.Screen
            name="AddCropProtectionApplicationSelectMachineConfig"
            options={{ title: "" }}
            component={AddCropProtectionApplicationSelectMachineConfigScreen}
          />
          <Stack.Screen
            name="AddCropProtectionApplicationSelectQuantity"
            options={{ title: "" }}
            component={AddCropProtectionApplicationSelectQuantityScreen}
          />
          <Stack.Screen
            name="AddCropProtectionApplicationSelectPlots"
            options={{ title: "", headerShown: false }}
            component={AddCropProtectionApplicationSelectPlotsScreen}
          />
          <Stack.Screen
            name="AddCropProtectionApplicationDivideOnPlots"
            options={{ title: "" }}
            component={AddCropProtectionApplicationDivideOnPlotsScreen}
          />
          <Stack.Screen
            name="AddCropProtectionApplicationSummary"
            options={{ title: "" }}
            component={AddCropProtectionApplicationSummaryScreen}
          />

          <Stack.Screen
            name="CropProtectionProducts"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={CropProtectionProductsScreen}
          />
          <Stack.Screen
            name="CreateCropProtectionProduct"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={CreateCropProtectionProductScreen}
          />
          <Stack.Screen
            name="EditCropProtectionProduct"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={EditCropProtectionProductScreen}
          />
          <Stack.Screen
            name="AgriColtivioInfo"
            options={{
              title: "",
              headerTitleStyle: { color: theme.colors.primary },
            }}
            component={AgriColtivioInfoScreen}
          />
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
          <Stack.Screen
            name="SearchFarmLocation"
            options={{ title: "", headerShown: false }}
            component={SearchFarmLocationModal}
          />
        </Stack.Group>
      </>
    );
  }
  return (
    <Stack.Navigator
      screenOptions={{
        // animation: "slide_from_right",
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        // headerBackTitle: "",
        headerTintColor: theme.colors.primary,
        headerBackButtonDisplayMode: "minimal",
        // headerLeft: ({ canGoBack }) =>
        //   canGoBack && (
        //     <Ionicons
        //       size={30}
        //       name="arrow-back"
        //       color={theme.colors.primary}
        //       onPress={() => navigation.goBack()}
        //     />
        //   ),
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
