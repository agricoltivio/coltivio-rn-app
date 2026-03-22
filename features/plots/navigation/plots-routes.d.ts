import { StackScreenProps } from "@/navigation/rootStackTypes";

export type PlotsStackParamList = {
  PlotsMap: { selectedPlotId?: string };
  AddPlotSummary: {
    cropId?: string;
  };
  EditPlot: { plotId: string };
  EditPlotModal: { plotId: string };
  DeletePlot: { plotId: string; name: string };
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
  PlotsMapOnboarding: undefined;
  AddPlotOnboarding: { variant: "draw" | "parcel" };
  SplitPlotOnboarding: undefined;
  MergePlotsOnboarding: undefined;
  AdjustPlotOnboarding: undefined;
  SplitPlotSummary: { plotId: string };
  MergePlotSummary: { plotIds: string[]; primaryPlotId: string };
  PlotList: undefined;
};

export type PlotsMapScreenProps = StackScreenProps<"PlotsMap">;

export type AddPlotSummaryScreenProps = StackScreenProps<"AddPlotSummary">;

export type EditPlotScreenProps =
  | StackScreenProps<"EditPlot">
  | StackScreenProps<"EditPlotModal">;

export type DeletePlotScreenProps = StackScreenProps<"DeletePlot">;

export type PlotDetailsScreenProps = StackScreenProps<"PlotDetails">;
export type PlotFertilizerApplicationsScreenProps =
  StackScreenProps<"PlotFertilizerApplications">;

export type PlotCropProtectionApplicationsScreenProps =
  StackScreenProps<"PlotCropProtectionApplications">;

export type PlotHarvestsScreenProps = StackScreenProps<"PlotHarvests">;

export type PlotTillagesScreenProps = StackScreenProps<"PlotTillages">;

export type SplitPlotOnboardingScreenProps =
  StackScreenProps<"SplitPlotOnboarding">;
export type SplitPlotSummaryScreenProps = StackScreenProps<"SplitPlotSummary">;
export type MergePlotSummaryScreenProps = StackScreenProps<"MergePlotSummary">;
export type PlotListScreenProps = StackScreenProps<"PlotList">;
