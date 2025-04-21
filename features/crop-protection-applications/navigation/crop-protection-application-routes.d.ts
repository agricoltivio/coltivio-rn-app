import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropProtectionApplicationStackParamList = {
  AddCropProtectionApplicationSelectDate: undefined;
  AddCropProtectionApplicationSelectProduct: { productId?: string };
  AddCropProtectionApplicationSelectMachineConfig: { equipmentId?: string };
  AddCropProtectionApplicationSelectQuantity: undefined;
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

export type AddCropProtectionApplicationSelectDateScreenProps =
  StackScreenProps<"AddCropProtectionApplicationSelectDate">;

export type AddCropProtectionApplicationSelectProductScreenProps =
  StackScreenProps<"AddCropProtectionApplicationSelectProduct">;

export type AddCropProtectionApplicationSelectMachineConfigScreenProps =
  StackScreenProps<"AddCropProtectionApplicationSelectMachineConfig">;

export type AddCropProtectionApplicationSelectQuantityScreenProps =
  StackScreenProps<"AddCropProtectionApplicationSelectQuantity">;
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
