import { StackScreenProps } from "@/navigation/rootStackTypes";

export type FarmStackParamList = {
  Farm: undefined;
  EditFarm: undefined;
  SearchFarmLocation: undefined;
  DeleteFarm: undefined;
  FarmUsers: undefined;
  MemberPermissions: { userId: string; memberName: string };
};

export type FarmScreenProps = StackScreenProps<"Farm">;
export type EditFarmScreenProps = StackScreenProps<"EditFarm">;

export type SearchFarmLocationModalProps =
  StackScreenProps<"SearchFarmLocation">;

export type DeleteFarmScreenProps = StackScreenProps<"DeleteFarm">;
export type FarmUsersScreenProps = StackScreenProps<"FarmUsers">;
export type MemberPermissionsScreenProps =
  StackScreenProps<"MemberPermissions">;
