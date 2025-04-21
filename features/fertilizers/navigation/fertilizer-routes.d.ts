import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type FertilizerStackParamList = {
  Fertilizers: undefined;
  CreateFertilizer: undefined;
  EditFertilizer: { fertilizerId: string };
};

export type FertilizersScreenProps = NativeStackScreenProps<
  FertilizerStackParamList,
  "Fertilizers"
>;

export type CreateFertilizerScreenProps = NativeStackScreenProps<
  FertilizerStackParamList,
  "CreateFertilizer"
>;

export type EditFertilizerScreenProps = NativeStackScreenProps<
  FertilizerStackParamList,
  "EditFertilizer"
>;
