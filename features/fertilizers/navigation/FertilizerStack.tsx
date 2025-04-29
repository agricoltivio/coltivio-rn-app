import { Stack } from "@/navigation/stack";
import { CreateFertilizerScreen } from "../CreateFertilizerScreen";
import { EditFertilizerScreen } from "../EditFertilizerScreen";
import { FertilizersScreen } from "../FertilizersScreen";

export function renderFertilizerStack() {
  return [
    <Stack.Screen
      key="fertilizers"
      name="Fertilizers"
      options={{
        title: "",
      }}
      component={FertilizersScreen}
    />,
    <Stack.Screen
      key="create-fertilizer"
      name="CreateFertilizer"
      options={{
        title: "",
      }}
      component={CreateFertilizerScreen}
    />,
    <Stack.Screen
      key="edit-fertilizer"
      name="EditFertilizer"
      options={{
        title: "",
      }}
      component={EditFertilizerScreen}
    />,
  ];
}
