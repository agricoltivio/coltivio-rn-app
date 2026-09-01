import { StackScreenProps } from "@/navigation/rootStackTypes";

export type FarmStackParamList = {
  Farm: undefined;
  EditFarm: undefined;
  SearchFarmLocation: undefined;
  MemberDetail: { userId: string; memberName: string };
  InviteUser: undefined;
  FarmPicker: undefined;
};

export type FarmScreenProps = StackScreenProps<"Farm">;
export type EditFarmScreenProps = StackScreenProps<"EditFarm">;

export type SearchFarmLocationModalProps =
  StackScreenProps<"SearchFarmLocation">;

export type MemberDetailScreenProps = StackScreenProps<"MemberDetail">;
export type InviteUserScreenProps = StackScreenProps<"InviteUser">;
export type FarmPickerScreenProps = StackScreenProps<"FarmPicker">;
