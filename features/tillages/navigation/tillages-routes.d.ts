import { StackScreenProps } from "@/navigation/rootStackTypes";

export type TillagesStackParamList = {
  Tillages: undefined;
  TillagesOfYearList: { year: number };
  TillageDetails: { tillageId: string };
  SelectTillageDate: undefined;
  ConfigureTillage: undefined;
  SelectTillagePlots: undefined;
  TillageSummary: undefined;
};

export type TillagesScreenProps = StackScreenProps<"Tillages">;

export type TillagesOfYearListScreenProps =
  StackScreenProps<"TillagesOfYearList">;

export type TillageDetailsScreenProps = StackScreenProps<"TillageDetails">;

export type SelectTillageDateScreenProps =
  StackScreenProps<"SelectTillageDate">;

export type ConfigureTillageScreenProps =
  StackScreenProps<"ConfigureTillage">;

export type SelectTillagePlotsScreenProps =
  StackScreenProps<"SelectTillagePlots">;

export type TillageSummaryScreenProps =
  StackScreenProps<"TillageSummary">;
