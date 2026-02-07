import { StackScreenProps } from "@/navigation/rootStackTypes";

export type TillagesStackParamList = {
  Tillages: undefined;
  TillagesOfYearList: { year: number };
  TillageDetails: { tillageId: string };
  AddTillageConfiguration: undefined;
  AddTillageSelectPlots: undefined;
  AddTillageAdditionalNotes: undefined;
  AddTillageSummary: undefined;
};

export type TillagesScreenProps = StackScreenProps<"Tillages">;

export type TillagesOfYearListScreenProps =
  StackScreenProps<"TillagesOfYearList">;

export type TillageDetailsScreenProps = StackScreenProps<"TillageDetails">;

export type AddTillageConfigurationScreenProps =
  StackScreenProps<"AddTillageConfiguration">;

export type AddTillageSelectPlotsScreenProps =
  StackScreenProps<"AddTillageSelectPlots">;

export type AddTillageAdditionalNotesScreenProps =
  StackScreenProps<"AddTillageAdditionalNotes">;

export type AddTillageSummaryScreenProps =
  StackScreenProps<"AddTillageSummary">;
