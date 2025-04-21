import { PlotsStackParamList } from "@/navigation/PlotsStackTypes";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type PlotsStackParamList = {
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
  PlotCropRotations: { plotId: string; name: string };
  AddPlotCropRotation: { plotId: string };
  EditPlotCropRotation: {
    plotName?: string;
    rotationId: string;
    canDelete?: boolean;
  };
};

export type PlotsMapScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "PlotsMap"
>;

export type AddPlotMapScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "AddPlotMap"
>;

export type AddPlotSummaryScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "AddPlotSummary"
>;

export type EditPlotScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "EditPlot"
>;

export type EditPlotMapScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "EditPlotMap"
>;

export type DeletePlotScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "DeletePlot"
>;

export type PlotsScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "Plots"
>;

export type PlotDetailsScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "PlotDetails"
>;
export type PlotFertilizerApplicationsScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "PlotFertilizerApplications"
>;

export type PlotFertilizerApplicationsOfYearScreenProps =
  NativeStackScreenProps<
    PlotsStackParamList,
    "PlotFertilizerApplicationsOfYear"
  >;

export type PlotFertilizerApplicationsOfYearListScreenProps =
  NativeStackScreenProps<
    PlotsStackParamList,
    "PlotFertilizerApplicationsOfYearList"
  >;

export type PlotCropProtectionApplicationsScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "PlotCropProtectionApplications"
>;

export type PlotCropProtectionApplicationsOfYearScreenProps =
  NativeStackScreenProps<
    PlotsStackParamList,
    "PlotCropProtectionApplicationsOfYear"
  >;

export type PlotCropProtectionApplicationsOfYearListScreenProps =
  NativeStackScreenProps<
    PlotsStackParamList,
    "PlotCropProtectionApplicationsOfYearList"
  >;

export type PlotHarvestsScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "PlotHarvests"
>;
export type PlotHarvestsOfYearListScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "PlotHarvestsOfYearList"
>;

export type PlotHarvestsOfYearScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "PlotHarvestsOfYear"
>;

export type PlotTillagesScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "PlotTillages"
>;
export type PlotTillagesOfYearListScreenProps = NativeStackScreenProps<
  PlotsStackParamList,
  "PlotTillagesOfYearList"
>;
