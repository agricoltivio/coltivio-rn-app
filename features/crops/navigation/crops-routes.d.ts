import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropsStackParamList = {
  Crops: undefined;
  CreateCrop: undefined;
  EditCrop: { cropId: string };
};

export type CropsScreenProps = StackScreenProps<"Crops">;

export type CreateCropScreenProps = StackScreenProps<"CreateCrop">;

export type EditCropScreenProps = StackScreenProps<"EditCrop">;
