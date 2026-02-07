import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropProtectionApplicationStackParamList = {
  AddCropProtectionApplicationConfiguration: {
    productId?: string;
  };
  AddCropProtectionApplicationSelectPlots: undefined;
  AddCropProtectionApplicationDivideOnPlots: undefined;
  AddCropProtectionApplicationAdditionalNotes: undefined;
  AddCropProtectionApplicationSummary: undefined;

  CropProtectionApplications: undefined;
  CropProtectionApplicationsOfYear: { year: number };
  CropProtectionApplicationsOfYearList: { year: number };
  CropProtectionApplicationDetails: { cropProtectionApplicationId: string };
};

export type CropProtectionApplicationsScreenProps =
  StackScreenProps<"CropProtectionApplications">;

export type CropProtectionApplicationDetailsScreenProps =
  StackScreenProps<"CropProtectionApplicationDetails">;

export type AddCropProtectionApplicationConfigurationScreenProps =
  StackScreenProps<"AddCropProtectionApplicationConfiguration">;

export type AddCropProtectionApplicationSelectPlotsScreenProps =
  StackScreenProps<"AddCropProtectionApplicationSelectPlots">;
export type AddCropProtectionApplicationDivideOnPlotsScreenProps =
  StackScreenProps<"AddCropProtectionApplicationDivideOnPlots">;
export type AddCropProtectionApplicationAdditionalNotesScreenProps =
  StackScreenProps<"AddCropProtectionApplicationAdditionalNotes">;
export type AddCropProtectionApplicationSummaryScreenProps =
  StackScreenProps<"AddCropProtectionApplicationSummary">;

export type CropProtectionApplicationsOfYearScreenProps =
  StackScreenProps<"CropProtectionApplicationsOfYear">;

export type CropProtectionApplicationsOfYearListScreenProps =
  StackScreenProps<"CropProtectionApplicationsOfYearList">;
