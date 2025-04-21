import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type FieldCalendarStackParamList = {
  FieldCalendar: undefined;
  FieldCalendarExport: undefined;
  FieldCalendarExportSuccess: undefined;
};

export type FieldCalendarScreenProps = NativeStackScreenProps<
  FieldCalendarStackParamList,
  "FieldCalendar"
>;

export type FieldCalendarExportScreenProps = NativeStackScreenProps<
  FieldCalendarStackParamList,
  "FieldCalendarExport"
>;

export type FieldCalendarExportSuccessScreenProps = NativeStackScreenProps<
  FieldCalendarStackParamList,
  "FieldCalendarExportSuccess"
>;
