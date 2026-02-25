import { Stack } from "@/navigation/stack";
import { CreateCropFamilyScreen } from "../CreateCropFamilyScreen";
import { CropFamiliesScreen } from "../CropFamiliesScreen";
import { EditCropFamilyScreen } from "../EditCropFamilyScreen";

export function renderCropFamiliesStack() {
  return [
    <Stack.Screen
      key="crop-families"
      name="CropFamilies"
      options={{
        title: "",
      }}
      component={CropFamiliesScreen}
    />,
    <Stack.Screen
      key="create-crop-family"
      name="CreateCropFamily"
      options={{
        title: "",
      }}
      component={CreateCropFamilyScreen}
    />,
    <Stack.Screen
      key="edit-crop-family"
      name="EditCropFamily"
      options={{
        title: "",
      }}
      component={EditCropFamilyScreen}
    />,
  ];
}
