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
  renderFarmModalStack,
  renderFarmStack,
} from "@/features/farms/navigation/FarmStack";
import { renderFertilizerApplicationStack } from "@/features/fertilizer-application/navigation/FertilizerApplicationStack";
import { renderFertilizerStack } from "@/features/fertilizers/navigation/FertilizerStack";
import { renderFieldCalendarStack } from "@/features/field-calendar/navigation/FieldCalendarStack";
import { renderHarvestStack } from "@/features/harvests/navigation/HarvestStack";
import { renderHomeStack } from "@/features/home/navigation/HomeStack";
import { renderPlotsStack } from "@/features/plots/navigation/PlotsStack";
import { renderTillagesStack } from "@/features/tillages/navigation/TillagesStack";
import { renderUserStack } from "@/features/user/navigation/UserStack";
import { useUserQuery } from "@/features/user/users.hooks";
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
