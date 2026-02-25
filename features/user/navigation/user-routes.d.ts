import { StackScreenProps } from "@/navigation/rootStackTypes";

export type UserStackParamList = {
  UserAccount: undefined;
  OnboardingSettings: undefined;
  AppSettings: undefined;
  SpeedDialSettings: undefined;
  ChangeUserName: undefined;
  ChangeEmail: undefined;
  ChangeEmailPending: { newEmail: string };
  EmailVerified: undefined;
  ChangePassword: undefined;
  DevSettings: undefined;
};

export type UserAccountScreenProps = StackScreenProps<"UserAccount">;
export type OnboardingSettingsScreenProps = StackScreenProps<"OnboardingSettings">;
export type AppSettingsScreenProps = StackScreenProps<"AppSettings">;
export type SpeedDialSettingsScreenProps = StackScreenProps<"SpeedDialSettings">;
export type ChangeUserNameScreenProps = StackScreenProps<"ChangeUserName">;

export type ChangeEmailScreenProps = StackScreenProps<"ChangeEmail">;
export type ChangeEmailPendingScreenProps =
  StackScreenProps<"ChangeEmailPending">;
export type EmailVerifiedScreenProps = StackScreenProps<"EmailVerified">;
export type ChangePasswordScreenProps = StackScreenProps<"ChangePassword">;
export type DevSettingsScreenProps = StackScreenProps<"DevSettings">;
