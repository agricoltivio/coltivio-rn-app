import { CropProtectionUnit } from "@/api/cropProtectionProducts.api";
import { FertilizerUnit } from "@/api/fertilizers.api";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  PasswordResetLinkSent: undefined;
  ResetPassword: undefined;

  UnexpectedError: undefined;

  // onboarding
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

  // main
  Home: undefined;
  UserAccount: undefined;
  ChangeUserName: undefined;
  ChangeEmail: undefined;
  ChangePassword: undefined;
  Farm: undefined;
  EditFarmName: undefined;
  EditFarmLocation: undefined;
  SearchFarmLocation: undefined;
  DeleteFarm: undefined;
  PlotsMap: undefined;
  AddPlotMap: undefined;
  AddPlotSummary: {
    geometry: GeoJSON.MultiPolygon;
    centroid: GeoJSON.Point;
    size: number;
    usage?: number;
    localId?: string;
    cuttingDate?: string;
  };
  EditPlot: { plotId: string; area?: number; polygon?: GeoJSON.MultiPolygon };
  EditPlotMap: { plotId: string };
  DeletePlot: { plotId: string; name: string };
  Plots: undefined;
  PlotDetails: { plotId: string };

  CropRotations: undefined;
  CropRotationsOfYearList: { year: number };
  PlotCropRotations: { plotId: string; name: string };
  AddPlotCropRotation: { plotId: string };
  EditPlotCropRotation: {
    plotName?: string;
    rotationId: string;
    canDelete?: boolean;
  };

  AddCropRotationSelectStartDate: undefined;
  AddCropRotationSelectCrop: undefined;
  AddCropRotationSelectPlots: undefined;
  AddCropRotationSummary: undefined;

  Tillages: undefined;
  TillagesOfYearList: { year: number };
  TillageDetails: { tillageId: string };
  AddTillageSelectDate: undefined;
  AddTillageSelectEquipment: undefined;
  AddTillageSelectPlots: undefined;
  AddTillageSummary: undefined;

  PlotHarvests: { plotId: string; name: string };
  PlotHarvestsOfYear: {
    plotId: string;
    year: number;
    name: string;
  };
  PlotHarvestsOfYearList: {
    plotId: string;
    year: number;
    name: string;
  };
  PlotFertilizerApplications: {
    plotId: string;
    name: string;
  };
  PlotFertilizerApplicationsOfYear: {
    plotId: string;
    year: number;
    name: string;
  };
  PlotFertilizerApplicationsOfYearList: {
    plotId: string;
    year: number;
    name: string;
  };

  PlotCropProtectionApplications: {
    plotId: string;
    name: string;
  };
  PlotCropProtectionApplicationsOfYear: {
    plotId: string;
    year: number;
    name: string;
  };
  PlotCropProtectionApplicationsOfYearList: {
    plotId: string;
    year: number;
    name: string;
  };
  PlotTillages: { plotId: string; name: string };
  PlotTillagesOfYearList: {
    plotId: string;
    year: number;
    name: string;
  };
  MachineConfigs: undefined;
  CreateFarmEquipment: {
    type?: "forage" | "fertilization" | "tillage" | "cropProtection";
  };
  CreateHarvestingMachinery: undefined;
  CreateFertilizerSpreader: { unit?: FertilizerUnit };
  EditHarvestingMachinery: { harvestingMachineryId: string };
  EditFertilizerSpreader: { fertilizerSpreaderId: string };
  CreateCropProtectionEquipment: { unit?: CropProtectionUnit };
  EditCropProtectionEquipment: { cropProtectionEquipmentId: string };
  CreateTillageEquipment: undefined;
  EditTillageEquipment: { tillageEquipmentId: string };

  FieldCalendar: undefined;
  FieldCalendarExport: undefined;
  FieldCalendarExportSuccess: undefined;

  Harvests: undefined;
  HarvestDetails: { harvestId: string };
  HarvestsOfYear: { year: number };
  HarvestsOfYearList: { year: number };
  SelectHarvestDate: undefined;
  SelectHarvestCrop: undefined;
  SelectHarvestingMachinery: undefined;
  SelectHarvestQuantity: undefined;
  SelectHarvstPlots: undefined;
  DivideHarvestOnPlots: undefined;
  HarvestSummary: undefined;

  Crops: undefined;
  CreateCrop: undefined;
  EditCrop: { cropId: string };

  Fertilizers: undefined;
  CreateFertilizer: undefined;
  EditFertilizer: { fertilizerId: string };

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

  CropProtectionProducts: undefined;
  CreateCropProtectionProduct: undefined;
  EditCropProtectionProduct: { cropProtectionProductId: string };

  AgriColtivioInfo: undefined;
};

export type SignInScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SignIn"
>;

export type SignUpScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SignUp"
>;

export type ForgotPasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ForgotPassword"
>;

export type PasswordResetLinkSentScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PasswordResetLinkSent"
>;

export type ResetPasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ResetPassword"
>;

export type UnexpectedErrorScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "UnexpectedError"
>;
export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;
export type UserAccountScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "UserAccount"
>;
export type ChangeUserNameScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ChangeUserName"
>;

export type ChangeEmailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ChangeEmail"
>;
export type ChangePasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ChangePassword"
>;
export type FarmScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Farm"
>;
export type EditFarmNameScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditFarmName"
>;

export type EditFarmLocationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditFarmLocation"
>;

export type SearchFarmLocationModalProps = NativeStackScreenProps<
  RootStackParamList,
  "SearchFarmLocation"
>;

export type DeleteFarmScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "DeleteFarm"
>;

export type PlotsMapScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlotsMap"
>;

export type AddPlotMapScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddPlotMap"
>;

export type AddPlotSummaryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddPlotSummary"
>;

export type EditPlotScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditPlot"
>;

export type EditPlotMapScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditPlotMap"
>;

export type DeletePlotScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "DeletePlot"
>;

export type PlotsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Plots"
>;

export type PlotDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlotDetails"
>;
export type CropRotationsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CropRotations"
>;
export type CropRotationsOfYearListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CropRotationsOfYearList"
>;

export type PlotCropRotationsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlotCropRotations"
>;

export type AddCropRotationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddPlotCropRotation"
>;

export type EditCropRotationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditPlotCropRotation"
>;

export type AddCropRotationSelectStartDateScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddCropRotationSelectStartDate"
>;
export type AddCropRotationSelectCropScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddCropRotationSelectCrop"
>;
export type AddCropRotationSelectPlotsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddCropRotationSelectPlots"
>;
export type AddCropRotationSummaryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddCropRotationSummary"
>;

export type TillagesScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Tillages"
>;

export type TillagesOfYearListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "TillagesOfYearList"
>;

export type TillageDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "TillageDetails"
>;

export type AddTillageSelectDateScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddTillageSelectDate"
>;
export type AddTillageSelectEquipmentScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddTillageSelectEquipment"
>;
export type AddTillageSelectPlotsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddTillageSelectPlots"
>;
export type AddTillageSummaryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddTillageSummary"
>;

export type PlotFertilizerApplicationsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlotFertilizerApplications"
>;

export type PlotFertilizerApplicationsOfYearScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "PlotFertilizerApplicationsOfYear"
  >;

export type PlotFertilizerApplicationsOfYearListScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "PlotFertilizerApplicationsOfYearList"
  >;

export type PlotCropProtectionApplicationsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlotCropProtectionApplications"
>;

export type PlotCropProtectionApplicationsOfYearScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "PlotCropProtectionApplicationsOfYear"
  >;

export type PlotCropProtectionApplicationsOfYearListScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "PlotCropProtectionApplicationsOfYearList"
  >;

export type PlotHarvestsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlotHarvests"
>;
export type PlotHarvestsOfYearListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlotHarvestsOfYearList"
>;

export type PlotHarvestsOfYearScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlotHarvestsOfYear"
>;

export type PlotTillagesScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlotTillages"
>;
export type PlotTillagesOfYearListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "PlotTillagesOfYearList"
>;

export type MachineConfigsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "MachineConfigs"
>;

export type CreateFarmEquipmentScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CreateFarmEquipment"
>;

export type CreateHarvestingMachineryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CreateHarvestingMachinery"
>;

export type EditHarvestingMachineryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditHarvestingMachinery"
>;

export type CreateFertilizerSpreaderScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CreateFertilizerSpreader"
>;

export type EditFertilizerSpreaderScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditFertilizerSpreader"
>;

export type CreateCropProtectionEquipmentScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CreateCropProtectionEquipment"
>;

export type EditCropProtectionEquipmentScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditCropProtectionEquipment"
>;

export type CreateTillageEquipmentScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CreateTillageEquipment"
>;

export type EditTillageEquipmentScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditTillageEquipment"
>;

export type FieldCalendarScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "FieldCalendar"
>;

export type FieldCalendarExportScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "FieldCalendarExport"
>;

export type FieldCalendarExportSuccessScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "FieldCalendarExportSuccess"
>;

export type FertilizersScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Fertilizers"
>;

export type CreateFertilizerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CreateFertilizer"
>;

export type EditFertilizerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditFertilizer"
>;

export type CropsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Crops"
>;

export type CreateCropScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CreateCrop"
>;

export type EditCropScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditCrop"
>;

export type HarvestsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Harvests"
>;

export type HarvestsOfYearScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "HarvestsOfYear"
>;

export type HarvestOfYearListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "HarvestsOfYearList"
>;
export type HarvestDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "HarvestDetails"
>;

export type SelectHarvestDateScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectHarvestDate"
>;

export type SelectHarvestPlantScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectHarvestCrop"
>;
export type SelectHarvestingMachineryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectHarvestingMachinery"
>;

export type SelectHarvestQuantityScreenprops = NativeStackScreenProps<
  RootStackParamList,
  "SelectHarvestQuantity"
>;

export type SelectHarvestPlotsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectHarvstPlots"
>;
export type DivideHarvestOnPlotsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "DivideHarvestOnPlots"
>;
export type HarvestSummaryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "HarvestSummary"
>;

export type FertilizerApplicationsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "FertilizerApplications"
>;

export type FertilizerApplicationDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "FertilizerApplicationDetails"
>;

export type AddFertilizerApplicationSelectDateScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddFertilizerApplicationSelectDate"
  >;

export type AddFertilizerApplicationSelectFertilizerScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddFertilizerApplicationSelectFertilizer"
  >;

export type AddFertilizerApplicationSelectSpreaderScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddFertilizerApplicationSelectSpreader"
  >;

export type AddFertilizerApplicationSelectQuantityScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddFertilizerApplicationSelectQuantity"
  >;
export type AddFertilizerApplicationSelectPlotsScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddFertilizerApplicationSelectPlots"
  >;
export type AddFertilizerApplicationDivideOnPlotsScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddFertilizerApplicationDivideOnPlots"
  >;
export type AddFertilizerApplicationSummaryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AddFertilizerApplicationSummary"
>;

export type FertilizerApplicationsOfYearScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "FertilizerApplicationsOfYear"
>;

export type FertilizerApplicationsOfYearListScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "FertilizerApplicationsOfYearList"
  >;

export type CropProtectionApplicationsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CropProtectionApplications"
>;

export type CropProtectionApplicationDetailsScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "CropProtectionApplicationDetails"
  >;

export type AddCropProtectionApplicationSelectDateScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddCropProtectionApplicationSelectDate"
  >;

export type AddCropProtectionApplicationSelectProductScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddCropProtectionApplicationSelectProduct"
  >;

export type AddCropProtectionApplicationSelectMachineConfigScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddCropProtectionApplicationSelectMachineConfig"
  >;

export type AddCropProtectionApplicationSelectQuantityScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddCropProtectionApplicationSelectQuantity"
  >;
export type AddCropProtectionApplicationSelectPlotsScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddCropProtectionApplicationSelectPlots"
  >;
export type AddCropProtectionApplicationDivideOnPlotsScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddCropProtectionApplicationDivideOnPlots"
  >;
export type AddCropProtectionApplicationSummaryScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "AddCropProtectionApplicationSummary"
  >;

export type CropProtectionApplicationsOfYearScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "CropProtectionApplicationsOfYear"
  >;

export type CropProtectionApplicationsOfYearListScreenProps =
  NativeStackScreenProps<
    RootStackParamList,
    "CropProtectionApplicationsOfYearList"
  >;

export type CropProtectionProductsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CropProtectionProducts"
>;

export type CreateCropProtectionProductScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "CreateCropProtectionProduct"
>;

export type EditCropProtectionProductScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "EditCropProtectionProduct"
>;

// onboarding
export type SelectFarmNameScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectFarmName"
>;

export type SelectFarmLocationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectFarmLocation"
>;

export type SelectFarmLocationSearchModalProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectFarmLocationSearch"
>;
export type SelectFederalFarmIdScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectFederalFarmId"
>;

export type SelectFederalFarmIdMapScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectFederalFarmIdMap"
>;

export type SelectParcelsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectParcels"
>;

export type SelectParcelsMapScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectParcelsMap"
>;

export type SelectPlotsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectPlots"
>;

export type SelectCropsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectCrops"
>;

export type SelectFertilizersScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SelectFertilizers"
>;

export type FarmSummaryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "FarmSummary"
>;

export type AgriColtivioInfoScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AgriColtivioInfo"
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
