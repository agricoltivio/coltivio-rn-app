import { StackScreenProps } from "@/navigation/rootStackTypes";

export type FarmStackParamList = {
  Farm: undefined;
  EditFarmName: undefined;
  EditFarmLocation: undefined;
  SearchFarmLocation: undefined;
  DeleteFarm: undefined;
};

export type FarmScreenProps = StackScreenProps<"Farm">;
export type EditFarmNameScreenProps = StackScreenProps<"EditFarmName">;

export type EditFarmLocationScreenProps = StackScreenProps<"EditFarmLocation">;

export type SearchFarmLocationModalProps =
  StackScreenProps<"SearchFarmLocation">;

export type DeleteFarmScreenProps = StackScreenProps<"DeleteFarm">;
