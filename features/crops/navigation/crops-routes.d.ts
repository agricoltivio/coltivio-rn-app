import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type CropsStackParamList = {
  Crops: undefined;
  CreateCrop: undefined;
  EditCrop: undefined;
};

export type CropsScreenProps = NativeStackScreenProps<
  CropsStackParamList,
  "Crops"
>;

export type CreateCropScreenProps = NativeStackScreenProps<
  CropsStackParamList,
  "CreateCrop"
>;

export type EditCropScreenProps = NativeStackScreenProps<
  CropsStackParamList,
  "EditCrop"
>;
