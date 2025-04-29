import { Stack } from "@/navigation/stack";
import { CreateCropScreen } from "../CreateCropScreen";
import { CropsScreen } from "../CropsScreen";
import { EditCropScreen } from "../EditCropScreen";

export function renderCropsStack() {
  return [
    <Stack.Screen
      key="crops"
      name="Crops"
      options={{
        title: "",
      }}
      component={CropsScreen}
    />,
    <Stack.Screen
      key="create-crop"
      name="CreateCrop"
      options={{
        title: "",
      }}
      component={CreateCropScreen}
    />,
    <Stack.Screen
      key="edit-crop"
      name="EditCrop"
      options={{
        title: "",
      }}
      component={EditCropScreen}
    />,
  ];
}
