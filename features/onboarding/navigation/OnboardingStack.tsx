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
import React from "react";
import { Stack } from "@/navigation/stack";
import { DefaultTheme } from "styled-components";

export function renderOnboardingStack(theme: DefaultTheme) {
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
