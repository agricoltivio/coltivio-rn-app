import { useSession } from "@/auth/SessionProvider";
import { renderAgriColtivioStack } from "@/features/agri-coltivio/navigation/AgriColtivioStack";
import { renderWikiStack } from "@/features/wiki/navigation/WikiStack";
import { renderTasksStack } from "@/features/tasks/navigation/TasksStack";
import { renderAnimalsStack } from "@/features/animals/navigation/AnimalsStack";
import { renderAuthStack } from "@/features/auth/navigation/AuthStack";
import { renderCropProtectionApplicationStack } from "@/features/crop-protection-applications/navigation/CropProtectionApplicationStack";
import { renderCropProtectionProductStack } from "@/features/crop-protection-products/navigation/CropProtectionProductStack";
import { renderCropsRotationStack } from "@/features/crop-rotations/navigation/CropRotationsStack";
import { renderCropFamiliesStack } from "@/features/crop-families/navigation/CropFamiliesStack";
import { renderCropsStack } from "@/features/crops/navigation/CropsStack";
import { renderErrorStack } from "@/features/errors/navigation/ErrorStack";
import {
  renderFarmCreationModalStack,
  renderFarmCreationStack,
  renderFarmModalStack,
  renderFarmStack,
} from "@/features/farms/navigation/FarmStack";
import { renderFarmPickerStack } from "@/features/farms/navigation/FarmPickerStack";
import { useActiveFarm } from "@/features/farms/ActiveFarmContext";
import { useFarmsQuery } from "@/features/farms/farms.hooks";
import { renderFertilizerApplicationStack } from "@/features/fertilizer-application/navigation/FertilizerApplicationStack";
import { renderFertilizerStack } from "@/features/fertilizers/navigation/FertilizerStack";
import { renderFieldCalendarStack } from "@/features/field-calendar/navigation/FieldCalendarStack";
import { renderHarvestStack } from "@/features/harvests/navigation/HarvestStack";
import { renderHomeStack } from "@/features/home/navigation/HomeStack";
import { renderPlotsStack } from "@/features/plots/navigation/PlotsStack";
import { renderTillagesStack } from "@/features/tillages/navigation/TillagesStack";
import { renderUserStack } from "@/features/user/navigation/UserStack";
import { useUserQuery } from "@/features/user/users.hooks";
import { LoadingScreen } from "@/components/branding/LoadingScreen";
import { SplashView } from "@/components/branding/SplashView";
import { useAppFonts } from "@/theme/fonts";
import { useNavigation } from "@react-navigation/native";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components/native";
import { MapDrawOnboardingScreen } from "../features/map/MapDrawOnboardingScreen";
import { SelectPlotsOnboardingScreen } from "../features/map/SelectPlotsOnboardingScreen";
import { renderOnboardingStack } from "../features/onboarding/navigation/OnboardingStack";
import { Stack } from "./stack";

SplashScreen.preventAutoHideAsync();

export function RootStack() {
  const { loadingFromStorage, token } = useSession();
  const theme = useTheme();
  const [nativeSplashHidden, setNativeSplashHidden] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const navigation = useNavigation();
  const [fontsLoaded] = useAppFonts();
  const {
    activeFarmId,
    setActiveFarmId,
    clearActiveFarmId,
    farmSelectionHydrated,
  } = useActiveFarm();
  const {
    farms,
    isFetched: farmsFetched,
    error: farmsError,
  } = useFarmsQuery(token != null);
  const {
    user,
    isFetched: userFetched,
    isFetching,
    error,
  } = useUserQuery(token != null && farmSelectionHydrated);

  const hasFarms = (farms?.count ?? 0) > 0;
  const needsFarmPicker =
    farms != null &&
    farms.count >= 2 &&
    (activeFarmId == null ||
      !farms.result.some((farm) => farm.id === activeFarmId));

  // Auto-select a single-farm user's only farm — no picker UI needed, matches today's
  // behavior where the x-farm-id header can be omitted entirely.
  useEffect(() => {
    if (farms?.count === 1 && activeFarmId !== farms.result[0].id) {
      setActiveFarmId(farms.result[0].id);
    }
  }, [farms, activeFarmId]);

  // farms.count === 1 is excluded here — that case is fully handled by the
  // auto-select effect above. Without this exclusion, both effects fire off
  // the same stale render when a user drops from 2 farms to 1 (e.g. removed
  // from one of them): auto-select reassigns to the remaining farm, then this
  // effect immediately clears it again, before settling on the next render.
  const hasInvalidFarmSelection =
    activeFarmId != null &&
    ((farms != null &&
      farms.count !== 1 &&
      !farms.result.some((farm) => farm.id === activeFarmId)) ||
      farmsError != null);
  useEffect(() => {
    if (hasInvalidFarmSelection) {
      clearActiveFarmId();
    }
  }, [hasInvalidFarmSelection]);

  const stillResolvingSession =
    loadingFromStorage ||
    (token != null &&
      (!farmsFetched ||
        !farmSelectionHydrated ||
        hasInvalidFarmSelection ||
        (hasFarms && !needsFarmPicker && !userFetched)));

  // Hand over from the native splash to SplashView as soon as Inter is ready — SplashView
  // draws the same composition, so there's no white frame while the session, farms and user
  // still load on a cold start.
  useEffect(() => {
    if (nativeSplashHidden || !fontsLoaded) {
      return;
    }
    SplashScreen.hideAsync();
    setNativeSplashHidden(true);
  }, [nativeSplashHidden, fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded && !stillResolvingSession) {
      setInitialLoadDone(true);
    }
  }, [fontsLoaded, stillResolvingSession]);

  if (!fontsLoaded) {
    return null;
  }

  if (stillResolvingSession) {
    return initialLoadDone ? <LoadingScreen /> : <SplashView />;
  }

  function renderStacks() {
    if (!token) {
      return renderAuthStack(theme);
    }
    if (farmsError) {
      console.error(farmsError);
      return renderErrorStack(theme);
    }

    if (!hasFarms) {
      return renderOnboardingStack(theme);
    }

    if (needsFarmPicker) {
      return renderFarmPickerStack();
    }

    if (error || (!user && isFetching)) {
      if (error) {
        console.error(error);
      }
      return renderErrorStack(theme);
    }

    return (
      <>
        <Stack.Group>
          {renderHomeStack(theme, navigation)}
          {renderUserStack()}
          {renderFarmStack()}
          {renderFarmCreationStack()}
          {renderPlotsStack(theme, navigation)}
          {renderCropsRotationStack()}
          {renderTillagesStack()}
          {renderFieldCalendarStack(theme, navigation)}
          {renderCropsStack()}
          {renderCropFamiliesStack()}
          {renderHarvestStack()}
          {renderFertilizerStack()}
          {renderFertilizerApplicationStack()}
          {renderCropProtectionApplicationStack()}
          {renderCropProtectionProductStack()}
          {renderAnimalsStack(theme, navigation)}
          {renderAgriColtivioStack()}
          {renderWikiStack(theme, navigation)}
          {renderTasksStack(theme, navigation)}
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
          {renderFarmCreationModalStack()}
          <Stack.Screen
            name="MapDrawOnboarding"
            component={MapDrawOnboardingScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SelectPlotsOnboarding"
            component={SelectPlotsOnboardingScreen}
            options={{ headerShown: false }}
          />
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
