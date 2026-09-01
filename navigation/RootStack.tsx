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
  const { activeFarmId, setActiveFarmId, clearActiveFarmId, loadingActiveFarm } =
    useActiveFarm();
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

  // Any farm-scoped request — including the farms list itself — 403s when the stored farm id
  // is stale (e.g. the farm was just deleted, or the user was removed from it on another
  // device). Drop the selection and let the farm picker gate re-prompt, instead of falling
  // into the generic error stack.
  const staleFarmId =
    error?.message?.includes("You are not a member of the specified farm") ||
    farmsError?.message?.includes(
      "You are not a member of the specified farm",
    );
  useEffect(() => {
    if (staleFarmId) {
      // clearActiveFarmId also discards the query cache, which includes refetching
      // farms.list — no need to invalidate it separately here.
      clearActiveFarmId();
    }
  }, [staleFarmId]);

  useEffect(() => {
    if (!splashScreenVisible || loadingFromStorage || !fontsLoaded) {
      return;
    }
    if (token) {
      if (!farmsFetched || loadingActiveFarm) {
        return;
      }
      if (hasFarms && !needsFarmPicker && !userFetched) {
        return;
      }
    }
    // hide the splash screen after the token has been loaded
    SplashScreen.hideAsync();
    setSplashScreenVisible(false);
  }, [
    loadingFromStorage,
    farmsFetched,
    loadingActiveFarm,
    hasFarms,
    needsFarmPicker,
    userFetched,
    fontsLoaded,
  ]);

  if (loadingFromStorage || !fontsLoaded) {
    return null;
  }
  if (token && (!farmsFetched || loadingActiveFarm)) {
    return null;
  }
  // A stale farm id is a recoverable, transient state — clearActiveFarmId (triggered by the
  // effect above) is about to make the next farms/me fetch succeed. Wait rather than flashing
  // the generic error stack.
  if (token && staleFarmId) {
    return null;
  }
  if (token && hasFarms && !needsFarmPicker && !userFetched) {
    return null;
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
