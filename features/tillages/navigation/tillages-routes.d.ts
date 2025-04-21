import { StackScreenProps } from "@/navigation/rootStackTypes";

export type TillagesStackParamList = {
  Tillages: undefined;
  TillagesOfYearList: { year: number };
  TillageDetails: { tillageId: string };
  AddTillageSelectDate: undefined;
  AddTillageSelectEquipment: undefined;
  AddTillageSelectPlots: undefined;
  AddTillageAdditionalNotes: undefined;
  AddTillageSummary: undefined;
};

export type TillagesScreenProps = StackScreenProps<"Tillages">;

export type TillagesOfYearListScreenProps =
  StackScreenProps<"TillagesOfYearList">;

export type TillageDetailsScreenProps = StackScreenProps<"TillageDetails">;

export type AddTillageSelectDateScreenProps =
  StackScreenProps<"AddTillageSelectDate">;

export type AddTillageSelectEquipmentScreenProps =
  StackScreenProps<"AddTillageSelectEquipment">;

export type AddTillageSelectPlotsScreenProps =
  StackScreenProps<"AddTillageSelectPlots">;

export type AddTillageAdditionalNotesScreenProps =
  StackScreenProps<"AddTillageAdditionalNotes">;

export type AddTillageSummaryScreenProps =
  StackScreenProps<"AddTillageSummary">;
