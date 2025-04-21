import { CropProtectionUnit } from "@/api/cropProtectionProducts.api";
import { FertilizerUnit } from "@/api/fertilizers.api";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

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
  FarmSummary: undefined;
};

export type SelectFarmNameScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectFarmName"
>;

export type SelectFarmLocationScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectFarmLocation"
>;

export type SelectFarmLocationSearchModalProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectFarmLocationSearch"
>;
export type SelectFederalFarmIdScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectFederalFarmId"
>;

export type SelectFederalFarmIdMapScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectFederalFarmIdMap"
>;

export type SelectParcelsScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectParcels"
>;

export type SelectParcelsMapScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectParcelsMap"
>;

export type SelectPlotsScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectPlots"
>;

export type SelectCropsScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectCrops"
>;

export type SelectFertilizersScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "SelectFertilizers"
>;

export type FarmSummaryScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "FarmSummary"
>;
