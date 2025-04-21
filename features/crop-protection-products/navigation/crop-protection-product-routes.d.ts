import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropProtectionProductsStackParamList = {
  CropProtectionProducts: undefined;
  CreateCropProtectionProduct: undefined;
  EditCropProtectionProduct: { cropProtectionProductId: string };
};

export type CropProtectionProductsScreenProps =
  StackScreenProps<"CropProtectionProducts">;

export type CreateCropProtectionProductScreenProps =
  StackScreenProps<"CreateCropProtectionProduct">;

export type EditCropProtectionProductScreenProps =
  StackScreenProps<"EditCropProtectionProduct">;
