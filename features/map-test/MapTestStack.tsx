import { Stack } from "@/navigation/stack";
import { MapTestScreen } from "./MapTestScreen";

export function renderMapTestStack() {
  return [
    <Stack.Screen
      key="map-test"
      name="MapTest"
      component={MapTestScreen}
      options={{ title: "Test Map", headerShown: false }}
    />,
  ];
}
