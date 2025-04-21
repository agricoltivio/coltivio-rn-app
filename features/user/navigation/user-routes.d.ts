import { StackScreenProps } from "@/navigation/rootStackTypes";

export type UserStackParamList = {
  UserAccount: undefined;
  ChangeUserName: undefined;
  ChangeEmail: undefined;
  ChangePassword: undefined;
};

export type UserAccountScreenProps = StackScreenProps<"UserAccount">;
export type ChangeUserNameScreenProps = StackScreenProps<"ChangeUserName">;

export type ChangeEmailScreenProps = StackScreenProps<"ChangeEmail">;
export type ChangePasswordScreenProps = StackScreenProps<"ChangePassword">;
