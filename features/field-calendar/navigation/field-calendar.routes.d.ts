import { StackScreenProps } from "@react-navigation/native-stack";

export type FieldCalendarStackParamList = {
  FieldCalendar: undefined;
  FieldCalendarExport: undefined;
  FieldCalendarExportSuccess: undefined;
};

export type FieldCalendarScreenProps = StackScreenProps<"FieldCalendar">;

export type FieldCalendarExportScreenProps =
  StackScreenProps<"FieldCalendarExport">;

export type FieldCalendarExportSuccessScreenProps =
  StackScreenProps<"FieldCalendarExportSuccess">;
