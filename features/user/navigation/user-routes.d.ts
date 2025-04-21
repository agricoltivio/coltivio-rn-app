import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type UserStackParamList = {
  UserAccount: undefined;
  ChangeUserName: undefined;
  ChangeEmail: undefined;
  ChangePassword: undefined;
};

export type UserAccountScreenProps = NativeStackScreenProps<
  UserStackParamList,
  "UserAccount"
>;
export type ChangeUserNameScreenProps = NativeStackScreenProps<
  UserStackParamList,
  "ChangeUserName"
>;

export type ChangeEmailScreenProps = NativeStackScreenProps<
  UserStackParamList,
  "ChangeEmail"
>;
export type ChangePasswordScreenProps = NativeStackScreenProps<
  UserStackParamList,
  "ChangePassword"
>;
