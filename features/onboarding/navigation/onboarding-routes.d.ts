import { CropProtectionUnit } from "@/api/cropProtectionProducts.api";
import { FertilizerUnit } from "@/api/fertilizers.api";
import { StackScreenProps } from "@/navigation/rootStackTypes";

export type OnboardingStackParamList = {
  SelectFarmName: undefined;
  SelectFarmLocation: undefined;
  SelectFarmLocationSearch: undefined;
  SelectFederalFarmId: undefined;
  SelectFederalFarmIdMap: undefined;
  SelectParcels: undefined;
  SelectParcelsMap: undefined;
  SelectPlots: undefined;
  SelectCrops: undefined;
  SelectFertilizers: undefined;
  OnboardingPreference: undefined;
  FarmSummary: undefined;
};

export type OnboardingPreferenceScreenProps =
  StackScreenProps<"OnboardingPreference">;

export type SelectFarmNameScreenProps = StackScreenProps<"SelectFarmName">;

export type SelectFarmLocationScreenProps =
  StackScreenProps<"SelectFarmLocation">;

export type SelectFarmLocationSearchModalProps =
  StackScreenProps<"SelectFarmLocationSearch">;
export type SelectFederalFarmIdScreenProps =
  StackScreenProps<"SelectFederalFarmId">;

export type SelectFederalFarmIdMapScreenProps =
  StackScreenProps<"SelectFederalFarmIdMap">;

export type SelectParcelsScreenProps = StackScreenProps<"SelectParcels">;

export type SelectParcelsMapScreenProps = StackScreenProps<"SelectParcelsMap">;

export type SelectPlotsScreenProps = StackScreenProps<"SelectPlots">;

export type SelectCropsScreenProps = StackScreenProps<"SelectCrops">;

export type SelectFertilizersScreenProps =
  StackScreenProps<"SelectFertilizers">;

export type FarmSummaryScreenProps = StackScreenProps<"FarmSummary">;
