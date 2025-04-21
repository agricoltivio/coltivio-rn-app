import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type FertilizerApplicationsStackParamList = {
  AddFertilizerApplicationSelectDate: undefined;
  AddFertilizerApplicationSelectFertilizer: { fertilizerId?: string };
  AddFertilizerApplicationSelectSpreader: { spreaderId?: string };
  AddFertilizerApplicationSelectQuantity: undefined;
  AddFertilizerApplicationSelectPlots: undefined;
  AddFertilizerApplicationDivideOnPlots: undefined;
  AddFertilizerApplicationSummary: undefined;

  FertilizerApplications: undefined;
  FertilizerApplicationsOfYear: { year: number };
  FertilizerApplicationsOfYearList: { year: number };
  FertilizerApplicationDetails: { fertilizerApplicationId: string };
};

export type FertilizerApplicationsScreenProps = NativeStackScreenProps<
  FertilizerApplicationsStackParamList,
  "FertilizerApplications"
>;

export type FertilizerApplicationDetailsScreenProps = NativeStackScreenProps<
  FertilizerApplicationsStackParamList,
  "FertilizerApplicationDetails"
>;

export type AddFertilizerApplicationSelectDateScreenProps =
  NativeStackScreenProps<
    FertilizerApplicationsStackParamList,
    "AddFertilizerApplicationSelectDate"
  >;

export type AddFertilizerApplicationSelectFertilizerScreenProps =
  NativeStackScreenProps<
    FertilizerApplicationsStackParamList,
    "AddFertilizerApplicationSelectFertilizer"
  >;

export type AddFertilizerApplicationSelectSpreaderScreenProps =
  NativeStackScreenProps<
    FertilizerApplicationsStackParamList,
    "AddFertilizerApplicationSelectSpreader"
  >;

export type AddFertilizerApplicationSelectQuantityScreenProps =
  NativeStackScreenProps<
    FertilizerApplicationsStackParamList,
    "AddFertilizerApplicationSelectQuantity"
  >;
export type AddFertilizerApplicationSelectPlotsScreenProps =
  NativeStackScreenProps<
    FertilizerApplicationsStackParamList,
    "AddFertilizerApplicationSelectPlots"
  >;
export type AddFertilizerApplicationDivideOnPlotsScreenProps =
  NativeStackScreenProps<
    FertilizerApplicationsStackParamList,
    "AddFertilizerApplicationDivideOnPlots"
  >;
export type AddFertilizerApplicationAdditionalNotesScreenProps =
  NativeStackScreenProps<
    FertilizerApplicationsStackParamList,
    "AddFertilizerApplicationAdditionalNotes"
  >;
export type AddFertilizerApplicationSummaryScreenProps = NativeStackScreenProps<
  FertilizerApplicationsStackParamList,
  "AddFertilizerApplicationSummary"
>;

export type FertilizerApplicationsOfYearScreenProps = NativeStackScreenProps<
  FertilizerApplicationsStackParamList,
  "FertilizerApplicationsOfYear"
>;

export type FertilizerApplicationsOfYearListScreenProps =
  NativeStackScreenProps<
    FertilizerApplicationsStackParamList,
    "FertilizerApplicationsOfYearList"
  >;
