import { StackScreenProps } from "@/navigation/rootStackTypes";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type FertilizerApplicationsStackParamList = {
  AddFertilizerApplicationSelectDate: undefined;
  AddFertilizerApplicationSelectFertilizer: { fertilizerId?: string };
  AddFertilizerApplicationSelectSpreader: { spreaderId?: string };
  AddFertilizerApplicationSelectQuantity: undefined;
  AddFertilizerApplicationSelectPlots: undefined;
  AddFertilizerApplicationDivideOnPlots: undefined;
  AddFertilizerApplicationAdditionalNotes: undefined;
  AddFertilizerApplicationSummary: undefined;

  FertilizerApplications: undefined;
  FertilizerApplicationsOfYear: { year: number };
  FertilizerApplicationsOfYearList: { year: number };
  FertilizerApplicationDetails: { fertilizerApplicationId: string };
};

export type FertilizerApplicationsScreenProps =
  StackScreenProps<"FertilizerApplications">;

export type FertilizerApplicationDetailsScreenProps =
  StackScreenProps<"FertilizerApplicationDetails">;

export type AddFertilizerApplicationSelectDateScreenProps =
  StackScreenProps<"AddFertilizerApplicationSelectDate">;

export type AddFertilizerApplicationSelectFertilizerScreenProps =
  StackScreenProps<"AddFertilizerApplicationSelectFertilizer">;

export type AddFertilizerApplicationSelectSpreaderScreenProps =
  StackScreenProps<"AddFertilizerApplicationSelectSpreader">;

export type AddFertilizerApplicationSelectQuantityScreenProps =
  StackScreenProps<"AddFertilizerApplicationSelectQuantity">;

export type AddFertilizerApplicationSelectPlotsScreenProps =
  StackScreenProps<"AddFertilizerApplicationSelectPlots">;

export type AddFertilizerApplicationDivideOnPlotsScreenProps =
  StackScreenProps<"AddFertilizerApplicationDivideOnPlots">;

export type AddFertilizerApplicationAdditionalNotesScreenProps =
  StackScreenProps<"AddFertilizerApplicationAdditionalNotes">;

export type AddFertilizerApplicationSummaryScreenProps =
  StackScreenProps<"AddFertilizerApplicationSummary">;

export type FertilizerApplicationsOfYearScreenProps =
  StackScreenProps<"FertilizerApplicationsOfYear">;

export type FertilizerApplicationsOfYearListScreenProps =
  StackScreenProps<"FertilizerApplicationsOfYearList">;
