import { StackScreenProps } from "@/navigation/rootStackTypes";

export type FertilizerApplicationsStackParamList = {
  SelectFertilizerAndDate: { fertilizerId?: string };
  ConfigureFertilizerApplication: undefined;
  SetFertilizerApplicationUnitQuantity: undefined;
  SelectFertilizerApplicationPlots: undefined;
  DivideFertilizerApplicationOnPlots: undefined;
  FertilizerApplicationSummary: undefined;

  FertilizerApplications: undefined;
  FertilizerApplicationDetails: { fertilizerApplicationId: string };
};

export type FertilizerApplicationsScreenProps =
  StackScreenProps<"FertilizerApplications">;

export type FertilizerApplicationDetailsScreenProps =
  StackScreenProps<"FertilizerApplicationDetails">;

export type SelectFertilizerAndDateScreenProps =
  StackScreenProps<"SelectFertilizerAndDate">;

export type ConfigureFertilizerApplicationScreenProps =
  StackScreenProps<"ConfigureFertilizerApplication">;

export type SetFertilizerApplicationUnitQuantityScreenProps =
  StackScreenProps<"SetFertilizerApplicationUnitQuantity">;

export type SelectFertilizerApplicationPlotsScreenProps =
  StackScreenProps<"SelectFertilizerApplicationPlots">;

export type DivideFertilizerApplicationOnPlotsScreenProps =
  StackScreenProps<"DivideFertilizerApplicationOnPlots">;

export type FertilizerApplicationSummaryScreenProps =
  StackScreenProps<"FertilizerApplicationSummary">;
