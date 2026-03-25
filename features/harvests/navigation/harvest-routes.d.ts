import { StackScreenProps } from "@/navigation/rootStackTypes";

export type HarvestStackParamList = {
  Harvests: undefined;
  HarvestDetails: { harvestId: string };
  SelectHarvestCropAndDate: { cropId?: string } | undefined;
  ConfigureHarvest: undefined;
  SetHarvestQuantity: undefined;
  SelectHarvestPlots: undefined;
  DivideHarvestOnPlots: undefined;
  HarvestSummary: undefined;
};

export type HarvestsScreenProps = StackScreenProps<"Harvests">;

export type HarvestDetailsScreenProps = StackScreenProps<"HarvestDetails">;

export type SelectHarvestCropAndDateScreenProps =
  StackScreenProps<"SelectHarvestCropAndDate">;

export type ConfigureHarvestScreenProps = StackScreenProps<"ConfigureHarvest">;

export type SetHarvestQuantityScreenProps =
  StackScreenProps<"SetHarvestQuantity">;

export type SelectHarvestPlotsScreenProps =
  StackScreenProps<"SelectHarvestPlots">;

export type DivideHarvestOnPlotsScreenProps =
  StackScreenProps<"DivideHarvestOnPlots">;

export type HarvestSummaryScreenProps = StackScreenProps<"HarvestSummary">;
