import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type CropProtectionProductsStackParamList = {
  CropProtectionProducts: undefined;
  CreateCropProtectionProduct: undefined;
  EditCropProtectionProduct: { cropProtectionProductId: string };
};

export type CropProtectionProductsScreenProps = NativeStackScreenProps<
  CropProtectionProductsStackParamList,
  "CropProtectionProducts"
>;

export type CreateCropProtectionProductScreenProps = NativeStackScreenProps<
  CropProtectionProductsStackParamList,
  "CreateCropProtectionProduct"
>;

export type EditCropProtectionProductScreenProps = NativeStackScreenProps<
  CropProtectionProductsStackParamList,
  "EditCropProtectionProduct"
>;
