import { Stack } from "@/navigation/stack";
import { CreateCropProtectionProductScreen } from "../CreateCropProtectionProductScreen";
import { CropProtectionProductsScreen } from "../CropProtectionProductsScreen";
import { EditCropProtectionProductScreen } from "../EditCropProtectionProductScreen";

export function renderCropProtectionProductStack() {
  return [
    <Stack.Screen
      key="crop-protection-products"
      name="CropProtectionProducts"
      options={{
        title: "",
      }}
      component={CropProtectionProductsScreen}
    />,
    <Stack.Screen
      key="create-crop-protection-product"
      name="CreateCropProtectionProduct"
      options={{
        title: "",
      }}
      component={CreateCropProtectionProductScreen}
    />,
    <Stack.Screen
      key="edit-crop-protection-product"
      name="EditCropProtectionProduct"
      options={{
        title: "",
      }}
      component={EditCropProtectionProductScreen}
    />,
  ];
}
