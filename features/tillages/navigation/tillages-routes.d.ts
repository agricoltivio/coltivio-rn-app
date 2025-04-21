import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type TillagesStackParamList = {
  Tillages: undefined;
  TillagesOfYearList: { year: number };
  TillageDetails: { tillageId: string };
  AddTillageSelectDate: undefined;
  AddTillageSelectEquipment: undefined;
  AddTillageSelectPlots: undefined;
  AddTillageSummary: undefined;
};

export type TillagesScreenProps = NativeStackScreenProps<
  TillagesStackParamList,
  "Tillages"
>;

export type TillagesOfYearListScreenProps = NativeStackScreenProps<
  TillagesStackParamList,
  "TillagesOfYearList"
>;

export type TillageDetailsScreenProps = NativeStackScreenProps<
  TillagesStackParamList,
  "TillageDetails"
>;

export type AddTillageSelectDateScreenProps = NativeStackScreenProps<
  TillagesStackParamList,
  "AddTillageSelectDate"
>;
export type AddTillageSelectEquipmentScreenProps = NativeStackScreenProps<
  TillagesStackParamList,
  "AddTillageSelectEquipment"
>;
export type AddTillageSelectPlotsScreenProps = NativeStackScreenProps<
  TillagesStackParamList,
  "AddTillageSelectPlots"
>;
export type AddTillageSummaryScreenProps = NativeStackScreenProps<
  TillagesStackParamList,
  "AddTillageSummary"
>;
