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
  const [splashScreenVisible, setSplashScreenVisible] = useState(true);
  const navigation = useNavigation();
  const [fontsLoaded] = useAppFonts();
  const {
    activeFarmId,
    setActiveFarmId,
    clearActiveFarmId,
    loadingActiveFarm,
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
  } = useUserQuery(token != null);

  const hasFarms = (farms?.count ?? 0) > 0;
  // 2+ farms and no valid (or stale) local selection — block on the picker rather than
  // guessing, since there's no server-side "current farm" concept to fall back to.
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

  // The stored selection can point at a farm the user is no longer (or never was) a member
  // of: farm deleted elsewhere, kicked on another device, or a stale value left over from a
  // previously signed-in account. Two signals, no error-string matching:
  //  - the farms list loaded and the selection isn't in it, or
  //  - the farms list itself failed while a selection is set (the backend rejects an
  //    x-farm-id the caller can't access, so the selection is the likely cause).
  // Either way: drop the selection, which also discards the query cache and refetches the
  // farms list unscoped — then auto-select / the picker re-resolves it.
  const hasInvalidFarmSelection =
    activeFarmId != null &&
    ((farms != null &&
      !farms.result.some((farm) => farm.id === activeFarmId)) ||
      farmsError != null);
  useEffect(() => {
    if (hasInvalidFarmSelection) {
      clearActiveFarmId();
    }
  }, [hasInvalidFarmSelection]);

  // Hand over from the native splash to SplashView as soon as Inter is ready.
  // SplashView keeps the same composition on screen while the session, farms
  // and user still load, so there is no white frame in between.
  useEffect(() => {
    if (!splashScreenVisible || !fontsLoaded) {
      return;
    }
    SplashScreen.hideAsync();
    setSplashScreenVisible(false);
  }, [splashScreenVisible, fontsLoaded]);

  // Inter is not ready yet, so rendering SplashView would show its text in the
  // system font for a frame and then swap. The native splash still covers the
  // screen at this point and carries the same brand ground.
  if (!fontsLoaded) {
    return null;
  }
  if (loadingFromStorage) {
    return <SplashView />;
  }
  if (token && (!farmsFetched || loadingActiveFarm)) {
    return <SplashView />;
  }
  // An invalid farm selection is a recoverable, transient state — clearActiveFarmId
  // (triggered by the effect above) is about to make the next farms/me fetch succeed.
  // Wait rather than flashing the generic error stack.
  if (token && hasInvalidFarmSelection) {
    return <SplashView />;
  }
  if (token && hasFarms && !needsFarmPicker && !userFetched) {
    return <SplashView />;
  }
  function renderStacks() {
    // in case no token is available, render the sign in screen
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
