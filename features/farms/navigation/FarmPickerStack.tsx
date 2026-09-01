import { Stack } from "@/navigation/stack";
import { FarmPickerScreen } from "../FarmPickerScreen";

export function renderFarmPickerStack() {
  return (
    <Stack.Screen
      name="FarmPicker"
      component={FarmPickerScreen}
      options={{
        headerShown: false,
      }}
    />
  );
}
