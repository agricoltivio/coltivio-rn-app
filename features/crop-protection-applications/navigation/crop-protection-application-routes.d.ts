import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type CropProtectionApplicationStackParamList = {
  AddCropProtectionApplicationSelectDate: undefined;
  AddCropProtectionApplicationSelectProduct: { productId?: string };
  AddCropProtectionApplicationSelectMachineConfig: { equipmentId?: string };
  AddCropProtectionApplicationSelectQuantity: undefined;
  AddCropProtectionApplicationSelectPlots: undefined;
  AddCropProtectionApplicationDivideOnPlots: undefined;
  AddCropProtectionApplicationSummary: undefined;

  CropProtectionApplications: undefined;
  CropProtectionApplicationsOfYear: { year: number };
  CropProtectionApplicationsOfYearList: { year: number };
  CropProtectionApplicationDetails: { cropProtectionApplicationId: string };
};

export type CropProtectionApplicationsScreenProps = NativeStackScreenProps<
  CropProtectionApplicationStackParamList,
  "CropProtectionApplications"
>;

export type CropProtectionApplicationDetailsScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "CropProtectionApplicationDetails"
  >;

export type AddCropProtectionApplicationSelectDateScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "AddCropProtectionApplicationSelectDate"
  >;

export type AddCropProtectionApplicationSelectProductScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "AddCropProtectionApplicationSelectProduct"
  >;

export type AddCropProtectionApplicationSelectMachineConfigScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "AddCropProtectionApplicationSelectMachineConfig"
  >;

export type AddCropProtectionApplicationSelectQuantityScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "AddCropProtectionApplicationSelectQuantity"
  >;
export type AddCropProtectionApplicationSelectPlotsScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "AddCropProtectionApplicationSelectPlots"
  >;
export type AddCropProtectionApplicationDivideOnPlotsScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "AddCropProtectionApplicationDivideOnPlots"
  >;
export type AddCropProtectionApplicationAdditionalNotesScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "AddCropProtectionApplicationAdditionalNotes"
  >;
export type AddCropProtectionApplicationSummaryScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "AddCropProtectionApplicationSummary"
  >;

export type CropProtectionApplicationsOfYearScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "CropProtectionApplicationsOfYear"
  >;

export type CropProtectionApplicationsOfYearListScreenProps =
  NativeStackScreenProps<
    CropProtectionApplicationStackParamList,
    "CropProtectionApplicationsOfYearList"
  >;
