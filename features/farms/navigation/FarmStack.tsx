import { Stack } from "@/navigation/stack";
import { EditFarmScreen } from "../EditFarmScreen";
import { FarmScreen } from "../FarmScreen";
import { MemberDetailScreen } from "../MemberDetailScreen";
import { InviteUserScreen } from "../InviteUserScreen";
import { SearchFarmLocationModal } from "../SearchFarmLocationModal";
import { JoinFarmScreen } from "@/features/onboarding/JoinFarmScreen";
import { SelectFarmNameScreen } from "@/features/onboarding/SelectFarmNameScreen";
import { SelectFarmLocationScreen } from "@/features/onboarding/SelectFarmLocationScreen";
import { SelectFarmLocationSearchModal } from "@/features/onboarding/SelectFarmLocationSearchModal";
import { SelectFederalFarmIdScreen } from "@/features/onboarding/SelectFederalFarmIdScreen";
import { SelectFederalFarmIdMapScreen } from "@/features/onboarding/SelectFederalFarmIdMapScreen";
import { OnboardingPreferenceScreen } from "@/features/onboarding/OnboardingPreferenceScreen";
import { FarmSummaryScreen } from "@/features/onboarding/FarmSummaryScreen";

export function renderFarmStack() {
  return [
    <Stack.Screen
      key="farm"
      name="Farm"
      component={FarmScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="edit-farm"
      name="EditFarm"
      component={EditFarmScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="member-detail"
      name="MemberDetail"
      component={MemberDetailScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="invite-user"
      name="InviteUser"
      component={InviteUserScreen}
      options={{
        title: "",
      }}
    />,
  ];
}

export function renderFarmModalStack() {
  return (
    <Stack.Screen
      name="SearchFarmLocation"
      options={{ title: "", headerShown: false }}
      component={SearchFarmLocationModal}
    />
  );
}

// Reuses the onboarding create-farm/join-farm screens (and OnboardingContext/
// useCreateFarmMutation/useAcceptInviteMutation behind them) so a user who already has a
// farm can create or join another one from the My Farm switcher, without a separate
// in-app form. Registered here (rather than only in OnboardingStack) so the routes are
// reachable from the main app stack too — the two render functions are never mounted
// at the same time, since onboarding and the main app stack are mutually exclusive.
export function renderFarmCreationStack() {
  return [
    <Stack.Screen
      key="join-farm"
      name="JoinFarm"
      component={JoinFarmScreen}
      options={{ title: "", headerShown: false }}
    />,
    <Stack.Screen
      key="select-farm-name"
      name="SelectFarmName"
      component={SelectFarmNameScreen}
      options={{ title: "", headerShown: false }}
    />,
    <Stack.Screen
      key="select-farm-location"
      name="SelectFarmLocation"
      component={SelectFarmLocationScreen}
      options={{ title: "", headerShown: false }}
    />,
    <Stack.Screen
      key="select-federal-farm-id-map"
      name="SelectFederalFarmIdMap"
      component={SelectFederalFarmIdScreen}
      options={{ headerShown: false }}
    />,
    <Stack.Screen
      key="select-federal-farm-id-parcel-map"
      name="SelectFederalFarmIdParcelMap"
      component={SelectFederalFarmIdMapScreen}
      options={{ animation: "fade", headerShown: false }}
    />,
    <Stack.Screen
      key="onboarding-preference"
      name="OnboardingPreference"
      component={OnboardingPreferenceScreen}
      options={{ title: "", headerShown: false }}
    />,
    <Stack.Screen
      key="farm-summary"
      name="FarmSummary"
      component={FarmSummaryScreen}
      options={{ title: "", headerShown: false }}
    />,
  ];
}

export function renderFarmCreationModalStack() {
  return (
    <Stack.Screen
      name="SelectFarmLocationSearch"
      options={{ title: "", headerShown: false }}
      component={SelectFarmLocationSearchModal}
    />
  );
}
