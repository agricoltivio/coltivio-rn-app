import { StackScreenProps } from "@/navigation/rootStackTypes";

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

export type PlotsMapScreenProps = StackScreenProps<"PlotsMap">;

export type AddPlotMapScreenProps = StackScreenProps<"AddPlotMap">;

export type AddPlotSummaryScreenProps = StackScreenProps<"AddPlotSummary">;

export type EditPlotScreenProps = StackScreenProps<"EditPlot">;

export type EditPlotMapScreenProps = StackScreenProps<"EditPlotMap">;

export type DeletePlotScreenProps = StackScreenProps<"DeletePlot">;

export type PlotsScreenProps = StackScreenProps<"Plots">;

export type PlotDetailsScreenProps = StackScreenProps<"PlotDetails">;
export type PlotFertilizerApplicationsScreenProps =
  StackScreenProps<"PlotFertilizerApplications">;

export type PlotFertilizerApplicationsOfYearScreenProps =
  StackScreenProps<"PlotFertilizerApplicationsOfYear">;

export type PlotFertilizerApplicationsOfYearListScreenProps =
  StackScreenProps<"PlotFertilizerApplicationsOfYearList">;

export type PlotCropProtectionApplicationsScreenProps =
  StackScreenProps<"PlotCropProtectionApplications">;

export type PlotCropProtectionApplicationsOfYearScreenProps =
  StackScreenProps<"PlotCropProtectionApplicationsOfYear">;

export type PlotCropProtectionApplicationsOfYearListScreenProps =
  StackScreenProps<"PlotCropProtectionApplicationsOfYearList">;

export type PlotHarvestsScreenProps = StackScreenProps<"PlotHarvests">;
export type PlotHarvestsOfYearListScreenProps =
  StackScreenProps<"PlotHarvestsOfYearList">;

export type PlotHarvestsOfYearScreenProps =
  StackScreenProps<"PlotHarvestsOfYear">;

export type PlotTillagesScreenProps = StackScreenProps<"PlotTillages">;
export type PlotTillagesOfYearListScreenProps =
  StackScreenProps<"PlotTillagesOfYearList">;
