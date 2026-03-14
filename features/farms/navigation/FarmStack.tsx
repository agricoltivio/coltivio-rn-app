import { Stack } from "@/navigation/stack";
import { DeleteFarmScreen } from "../DeleteFarmScreen";
import { EditFarmLocationScreen } from "../EditFarmLocationScreen";
import { EditFarmNameScreen } from "../EditFarmNameScreen";
import { FarmScreen } from "../FarmScreen";
import { FarmMembershipScreen } from "../FarmMembershipScreen";
import { FarmUsersScreen } from "../FarmUsersScreen";
import { SearchFarmLocationModal } from "../SearchFarmLocationModal";

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
      key="edit-farm-name"
      name="EditFarmName"
      component={EditFarmNameScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="edit-farm-location"
      name="EditFarmLocation"
      component={EditFarmLocationScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="delete-farm"
      name="DeleteFarm"
      component={DeleteFarmScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="farm-users"
      name="FarmUsers"
      component={FarmUsersScreen}
      options={{
        title: "",
      }}
    />,
    <Stack.Screen
      key="farm-membership"
      name="FarmMembership"
      component={FarmMembershipScreen}
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
