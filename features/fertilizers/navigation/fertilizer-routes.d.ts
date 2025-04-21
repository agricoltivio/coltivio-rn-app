import { StackScreenProps } from "@/navigation/rootStackTypes";

export type FertilizerStackParamList = {
  Fertilizers: undefined;
  CreateFertilizer: undefined;
  EditFertilizer: { fertilizerId: string };
};

export type FertilizersScreenProps = StackScreenProps<"Fertilizers">;

export type CreateFertilizerScreenProps = StackScreenProps<"CreateFertilizer">;

export type EditFertilizerScreenProps = StackScreenProps<"EditFertilizer">;
