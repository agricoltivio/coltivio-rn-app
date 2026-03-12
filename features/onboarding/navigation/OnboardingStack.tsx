import { FarmSummaryScreen } from "@/features/onboarding/FarmSummaryScreen";
import { JoinFarmScreen } from "@/features/onboarding/JoinFarmScreen";
import { OnboardingPreferenceScreen } from "@/features/onboarding/OnboardingPreferenceScreen";
import { OnboardingWelcomeScreen } from "@/features/onboarding/OnboardingWelcomeScreen";
import { SelectFarmLocationScreen } from "@/features/onboarding/SelectFarmLocationScreen";
import { SelectFarmLocationSearchModal } from "@/features/onboarding/SelectFarmLocationSearchModal";
import { SelectFarmNameScreen } from "@/features/onboarding/SelectFarmNameScreen";
import { SelectFederalFarmIdScreen } from "@/features/onboarding/SelectFederalFarmIdScreen";
import { SelectFederalFarmIdMapScreen } from "@/features/onboarding/SelectFederalFarmIdMapScreen";
import React from "react";
import { Stack } from "@/navigation/stack";
import { DefaultTheme } from "styled-components/native";

export function renderOnboardingStack(theme: DefaultTheme) {
  return (
    <>
      <Stack.Group>
        <Stack.Screen
          name="OnboardingWelcome"
          component={OnboardingWelcomeScreen}
          options={{ title: "", headerShown: false }}
        />
        <Stack.Screen
          name="JoinFarm"
          component={JoinFarmScreen}
          options={{ title: "", headerShown: false }}
        />
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
          name="SelectFederalFarmIdMap"
          component={SelectFederalFarmIdScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SelectFederalFarmIdParcelMap"
          component={SelectFederalFarmIdMapScreen}
          options={{
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="OnboardingPreference"
          component={OnboardingPreferenceScreen}
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
    </>
  );
}
