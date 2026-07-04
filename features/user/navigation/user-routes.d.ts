import { StackScreenProps } from "@/navigation/rootStackTypes";

export type UserStackParamList = {
  UserAccount: undefined;
  OnboardingSettings: undefined;
  AppSettings: undefined;
  SpeedDialSettings: undefined;
  HomeTilesSettings: undefined;
  MapSettings: undefined;
  LanguageSettings: undefined;
  ChangeUserName: undefined;
  DevSettings: undefined;
};

export type UserAccountScreenProps = StackScreenProps<"UserAccount">;
export type OnboardingSettingsScreenProps =
  StackScreenProps<"OnboardingSettings">;
export type AppSettingsScreenProps = StackScreenProps<"AppSettings">;
export type SpeedDialSettingsScreenProps =
  StackScreenProps<"SpeedDialSettings">;
export type HomeTilesSettingsScreenProps =
  StackScreenProps<"HomeTilesSettings">;
export type MapSettingsScreenProps = StackScreenProps<"MapSettings">;
export type LanguageSettingsScreenProps = StackScreenProps<"LanguageSettings">;
export type ChangeUserNameScreenProps = StackScreenProps<"ChangeUserName">;
export type DevSettingsScreenProps = StackScreenProps<"DevSettings">;
