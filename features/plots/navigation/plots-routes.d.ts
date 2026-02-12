import { StackScreenProps } from "@/navigation/rootStackTypes";

export type PlotsStackParamList = {
  PlotsMap: undefined;
  AddPlotMap: undefined;
  AddPlotSummary: {
    cropId?: string;
  };
  EditPlot: { plotId: string; area?: number; polygon?: GeoJSON.MultiPolygon };
  EditPlotMap: { plotId: string };
  DeletePlot: { plotId: string; name: string };
  Plots: undefined;
  PlotDetails: { plotId: string };
  PlotHarvests: { plotId: string; name: string };
  PlotFertilizerApplications: {
    plotId: string;
    name: string;
  };
  PlotCropProtectionApplications: {
    plotId: string;
    name: string;
  };
  PlotTillages: { plotId: string; name: string };
  SplitPlotMap: { plotId: string };
  SplitPlotSummary: { plotId: string };
  MergePlotsMap: { plotId: string };
  MergePlotSummary: { plotIds: string[] };
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

export type PlotCropProtectionApplicationsScreenProps =
  StackScreenProps<"PlotCropProtectionApplications">;

export type PlotHarvestsScreenProps = StackScreenProps<"PlotHarvests">;

export type PlotTillagesScreenProps = StackScreenProps<"PlotTillages">;

export type SplitPlotMapScreenProps = StackScreenProps<"SplitPlotMap">;
export type SplitPlotSummaryScreenProps = StackScreenProps<"SplitPlotSummary">;
export type MergePlotsMapScreenProps = StackScreenProps<"MergePlotsMap">;
export type MergePlotSummaryScreenProps = StackScreenProps<"MergePlotSummary">;
