import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropsStackParamList = {
  Crops: undefined;
  CreateCrop: undefined;
  EditCrop: undefined;
};

export type CropsScreenProps = StackScreenProps<"Crops">;

export type CreateCropScreenProps = StackScreenProps<"CreateCrop">;

export type EditCropScreenProps = StackScreenProps<"EditCrop">;
