import { Stack } from "@/navigation/stack";
import { CreateSeedScreen } from "../CreateSeedScreen";
import { EditSeedScreen } from "../EditSeedScreen";
import { SeedsScreen } from "../SeedsScreen";

export function renderSeedStack() {
  return [
    <Stack.Screen
      key="seeds"
      name="Seeds"
      options={{ title: "" }}
      component={SeedsScreen}
    />,
    <Stack.Screen
      key="create-seed"
      name="CreateSeed"
      options={{ title: "" }}
      component={CreateSeedScreen}
    />,
    <Stack.Screen
      key="edit-seed"
      name="EditSeed"
      options={{ title: "" }}
      component={EditSeedScreen}
    />,
  ];
}
