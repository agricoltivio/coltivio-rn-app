import { StackScreenProps } from "@react-navigation/native-stack";

export type FieldCalendarStackParamList = {
  FieldCalendar: undefined;
  FieldCalendarSettings: undefined;
  FieldCalendarExport: undefined;
  FieldCalendarExportSuccess: undefined;
  FieldCalendarOnboarding: undefined;
  FieldEventsMap: undefined;
};

export type FieldCalendarScreenProps = StackScreenProps<"FieldCalendar">;

export type FieldCalendarSettingsScreenProps =
  StackScreenProps<"FieldCalendarSettings">;

export type FieldCalendarExportScreenProps =
  StackScreenProps<"FieldCalendarExport">;

export type FieldCalendarExportSuccessScreenProps =
  StackScreenProps<"FieldCalendarExportSuccess">;

export type FieldCalendarOnboardingScreenProps =
  StackScreenProps<"FieldCalendarOnboarding">;

export type FieldEventsMapScreenProps = StackScreenProps<"FieldEventsMap">;
