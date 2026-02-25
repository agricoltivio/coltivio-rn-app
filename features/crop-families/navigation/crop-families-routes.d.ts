import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropFamiliesStackParamList = {
  CropFamilies: undefined;
  CreateCropFamily: undefined;
  EditCropFamily: { familyId: string };
};

export type CropFamiliesScreenProps = StackScreenProps<"CropFamilies">;

export type CreateCropFamilyScreenProps = StackScreenProps<"CreateCropFamily">;

export type EditCropFamilyScreenProps = StackScreenProps<"EditCropFamily">;
