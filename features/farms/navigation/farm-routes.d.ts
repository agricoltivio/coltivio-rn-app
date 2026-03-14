import { StackScreenProps } from "@/navigation/rootStackTypes";

export type FarmStackParamList = {
  Farm: undefined;
  EditFarmName: undefined;
  EditFarmLocation: undefined;
  SearchFarmLocation: undefined;
  DeleteFarm: undefined;
  FarmUsers: undefined;
  FarmMembership: undefined;
};

export type FarmScreenProps = StackScreenProps<"Farm">;
export type EditFarmNameScreenProps = StackScreenProps<"EditFarmName">;

export type EditFarmLocationScreenProps = StackScreenProps<"EditFarmLocation">;

export type SearchFarmLocationModalProps =
  StackScreenProps<"SearchFarmLocation">;

export type DeleteFarmScreenProps = StackScreenProps<"DeleteFarm">;
export type FarmUsersScreenProps = StackScreenProps<"FarmUsers">;
export type FarmMembershipScreenProps = StackScreenProps<"FarmMembership">;
