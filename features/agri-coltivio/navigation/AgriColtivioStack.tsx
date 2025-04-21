import { Stack } from "@/navigation/stack";
import { AgriColtivioInfoScreen } from "../AgriColtivioInfoScreen";

export function renderAgriColtivioStack() {
  return (
    <Stack.Screen
      key="agri-coltivio-info"
      name="AgriColtivioInfo"
      options={{
        title: "",
      }}
      component={AgriColtivioInfoScreen}
    />
  );
}
