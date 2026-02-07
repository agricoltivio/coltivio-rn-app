import { StackScreenProps } from "@/navigation/rootStackTypes";

export type HarvestStackParamList = {
  Harvests: undefined;
  HarvestDetails: { harvestId: string };
  HarvestsOfYear: { year: number };
  HarvestsOfYearList: { year: number };
  AddHarvestConfiguration: undefined;
  SelectHarvstPlots: undefined;
  DivideHarvestOnPlots: undefined;
  AddHarvestAdditionalNotes: undefined;
  HarvestSummary: undefined;
};
export type HarvestsScreenProps = StackScreenProps<"Harvests">;

export type HarvestsOfYearScreenProps = StackScreenProps<"HarvestsOfYear">;

export type HarvestOfYearListScreenProps =
  StackScreenProps<"HarvestsOfYearList">;
export type HarvestDetailsScreenProps = StackScreenProps<"HarvestDetails">;

export type AddHarvestConfigurationScreenProps =
  StackScreenProps<"AddHarvestConfiguration">;

export type SelectHarvestPlotsScreenProps =
  StackScreenProps<"SelectHarvstPlots">;
export type DivideHarvestOnPlotsScreenProps =
  StackScreenProps<"DivideHarvestOnPlots">;

export type AddHarvestAdditionalNotesScreenProps =
  StackScreenProps<"AddHarvestAdditionalNotes">;

export type HarvestSummaryScreenProps = StackScreenProps<"HarvestSummary">;
