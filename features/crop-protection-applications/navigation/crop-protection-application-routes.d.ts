import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropProtectionApplicationStackParamList = {
  SelectCropProtectionApplicationProductAndDate: { productId?: string };
  ConfigureCropProtectionApplication: undefined;
  SetCropProtectionApplicationUnitQuantity: undefined;
  SelectCropProtectionApplicationPlots: undefined;
  DivideCropProtectionApplicationOnPlots: undefined;
  CropProtectionApplicationSummary: undefined;

  CropProtectionApplications: undefined;
  CropProtectionApplicationsOfYear: { year: number };
  CropProtectionApplicationsOfYearList: { year: number };
  CropProtectionApplicationDetails: { cropProtectionApplicationId: string };
};

export type CropProtectionApplicationsScreenProps =
  StackScreenProps<"CropProtectionApplications">;

export type CropProtectionApplicationsOfYearScreenProps =
  StackScreenProps<"CropProtectionApplicationsOfYear">;

export type CropProtectionApplicationsOfYearListScreenProps =
  StackScreenProps<"CropProtectionApplicationsOfYearList">;

export type CropProtectionApplicationDetailsScreenProps =
  StackScreenProps<"CropProtectionApplicationDetails">;

export type SelectCropProtectionApplicationProductAndDateScreenProps =
  StackScreenProps<"SelectCropProtectionApplicationProductAndDate">;

export type ConfigureCropProtectionApplicationScreenProps =
  StackScreenProps<"ConfigureCropProtectionApplication">;

export type SetCropProtectionApplicationUnitQuantityScreenProps =
  StackScreenProps<"SetCropProtectionApplicationUnitQuantity">;

export type SelectCropProtectionApplicationPlotsScreenProps =
  StackScreenProps<"SelectCropProtectionApplicationPlots">;

export type DivideCropProtectionApplicationOnPlotsScreenProps =
  StackScreenProps<"DivideCropProtectionApplicationOnPlots">;

export type CropProtectionApplicationSummaryScreenProps =
  StackScreenProps<"CropProtectionApplicationSummary">;
