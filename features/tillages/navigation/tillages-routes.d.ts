import { StackScreenProps } from "@/navigation/rootStackTypes";

export type TillagesStackParamList = {
  Tillages: undefined;
  TillageDetails: { tillageId: string };
  SelectTillageDate: { plotId?: string; name?: string } | undefined;
  ConfigureTillage: undefined;
  SelectTillagePlots: undefined;
  TillageSummary: undefined;
};

export type TillagesScreenProps = StackScreenProps<"Tillages">;

export type TillageDetailsScreenProps = StackScreenProps<"TillageDetails">;

export type SelectTillageDateScreenProps =
  StackScreenProps<"SelectTillageDate">;

export type ConfigureTillageScreenProps = StackScreenProps<"ConfigureTillage">;

export type SelectTillagePlotsScreenProps =
  StackScreenProps<"SelectTillagePlots">;

export type TillageSummaryScreenProps = StackScreenProps<"TillageSummary">;
