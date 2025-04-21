import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type FarmStackParamList = {
  Farm: undefined;
  EditFarmName: undefined;
  EditFarmLocation: undefined;
  SearchFarmLocation: undefined;
  DeleteFarm: undefined;
};

export type FarmScreenProps = NativeStackScreenProps<
  FarmStackParamList,
  "Farm"
>;
export type EditFarmNameScreenProps = NativeStackScreenProps<
  FarmStackParamList,
  "EditFarmName"
>;

export type EditFarmLocationScreenProps = NativeStackScreenProps<
  FarmStackParamList,
  "EditFarmLocation"
>;

export type SearchFarmLocationModalProps = NativeStackScreenProps<
  FarmStackParamList,
  "SearchFarmLocation"
>;

export type DeleteFarmScreenProps = NativeStackScreenProps<
  FarmStackParamList,
  "DeleteFarm"
>;
