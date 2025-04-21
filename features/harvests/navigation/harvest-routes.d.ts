import { StackScreenProps } from "@/navigation/rootStackTypes";

export type HarvestStackParamList = {
  Harvests: undefined;
  HarvestDetails: { harvestId: string };
  HarvestsOfYear: { year: number };
  HarvestsOfYearList: { year: number };
  SelectHarvestDate: undefined;
  SelectHarvestCrop: undefined;
  SelectHarvestingMachinery: { machineId?: string };
  SelectHarvestQuantity: undefined;
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

export type SelectHarvestDateScreenProps =
  StackScreenProps<"SelectHarvestDate">;

export type SelectHarvestPlantScreenProps =
  StackScreenProps<"SelectHarvestCrop">;
export type SelectHarvestingMachineryScreenProps =
  StackScreenProps<"SelectHarvestingMachinery">;

export type SelectHarvestQuantityScreenprops =
  StackScreenProps<"SelectHarvestQuantity">;

export type SelectHarvestPlotsScreenProps =
  StackScreenProps<"SelectHarvstPlots">;
export type DivideHarvestOnPlotsScreenProps =
  StackScreenProps<"DivideHarvestOnPlots">;

export type AddHarvestAdditionalNotesScreenProps =
  StackScreenProps<"AddHarvestAdditionalNotes">;

export type HarvestSummaryScreenProps = StackScreenProps<"HarvestSummary">;
