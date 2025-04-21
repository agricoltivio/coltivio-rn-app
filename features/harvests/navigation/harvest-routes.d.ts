import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type HarvestStackParamList = {
  Harvests: undefined;
  HarvestDetails: { harvestId: string };
  HarvestsOfYear: { year: number };
  HarvestsOfYearList: { year: number };
  SelectHarvestDate: undefined;
  SelectHarvestCrop: undefined;
  SelectHarvestingMachinery: undefined;
  SelectHarvestQuantity: undefined;
  SelectHarvstPlots: undefined;
  DivideHarvestOnPlots: undefined;
  HarvestSummary: undefined;
};
export type HarvestsScreenProps = NativeStackScreenProps<
  HarvestStackParamList,
  "Harvests"
>;

export type HarvestsOfYearScreenProps = NativeStackScreenProps<
  HarvestStackParamList,
  "HarvestsOfYear"
>;

export type HarvestOfYearListScreenProps = NativeStackScreenProps<
  HarvestStackParamList,
  "HarvestsOfYearList"
>;
export type HarvestDetailsScreenProps = NativeStackScreenProps<
  HarvestStackParamList,
  "HarvestDetails"
>;

export type SelectHarvestDateScreenProps = NativeStackScreenProps<
  HarvestStackParamList,
  "SelectHarvestDate"
>;

export type SelectHarvestPlantScreenProps = NativeStackScreenProps<
  HarvestStackParamList,
  "SelectHarvestCrop"
>;
export type SelectHarvestingMachineryScreenProps = NativeStackScreenProps<
  HarvestStackParamList,
  "SelectHarvestingMachinery"
>;

export type SelectHarvestQuantityScreenprops = NativeStackScreenProps<
  HarvestStackParamList,
  "SelectHarvestQuantity"
>;

export type SelectHarvestPlotsScreenProps = NativeStackScreenProps<
  HarvestStackParamList,
  "SelectHarvstPlots"
>;
export type DivideHarvestOnPlotsScreenProps = NativeStackScreenProps<
  HarvestStackParamList,
  "DivideHarvestOnPlots"
>;
export type HarvestSummaryScreenProps = NativeStackScreenProps<
  HarvestStackParamList,
  "HarvestSummary"
>;
