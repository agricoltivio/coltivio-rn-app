import { StackScreenProps } from "@/navigation/rootStackTypes";

export type OnboardingStackParamList = {
  SelectFarmName: undefined;
  SelectFarmLocation: undefined;
  SelectFarmLocationSearch: undefined;
  SelectFederalFarmIdMap: undefined;
  SelectFederalFarmIdParcelMap: undefined;
  OnboardingPreference: undefined;
  FarmSummary: undefined;
};

export type SelectFarmNameScreenProps = StackScreenProps<"SelectFarmName">;

export type SelectFarmLocationScreenProps =
  StackScreenProps<"SelectFarmLocation">;

export type SelectFarmLocationSearchModalProps =
  StackScreenProps<"SelectFarmLocationSearch">;

export type SelectFederalFarmIdMapScreenProps =
  StackScreenProps<"SelectFederalFarmIdMap">;

export type SelectFederalFarmIdParcelMapScreenProps =
  StackScreenProps<"SelectFederalFarmIdParcelMap">;

export type OnboardingPreferenceScreenProps =
  StackScreenProps<"OnboardingPreference">;

export type FarmSummaryScreenProps = StackScreenProps<"FarmSummary">;
