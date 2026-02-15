import { StackScreenProps } from "@/navigation/rootStackTypes";
import { Region } from "react-native-maps";

export type PlotsStackParamList = {
  PlotsMap: { selectedPlotId?: string };
  AddPlotMap: { initialRegion?: Region };
  EditPlotMap: { plotId: string; initialRegion?: Region };
  SplitPlotMap: { plotId: string; initialRegion?: Region };
  MergePlotsMap: { plotId: string; initialRegion?: Region };
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
  EditPlotOnboarding: undefined;
  SplitPlotOnboarding: undefined;
  MergePlotsOnboarding: undefined;
  SplitPlotSummary: { plotId: string };
  MergePlotSummary: { plotIds: string[]; primaryPlotId: string };
  PlotList: undefined;
};

export type PlotsMapScreenProps = StackScreenProps<"PlotsMap">;

export type AddPlotMapScreenProps = StackScreenProps<"AddPlotMap">;
export type EditPlotMapScreenProps = StackScreenProps<"EditPlotMap">;
export type SplitPlotMapScreenProps = StackScreenProps<"SplitPlotMap">;
export type MergePlotsMapScreenProps = StackScreenProps<"MergePlotsMap">;

export type AddPlotSummaryScreenProps = StackScreenProps<"AddPlotSummary">;

export type EditPlotScreenProps = StackScreenProps<"EditPlot"> | StackScreenProps<"EditPlotModal">;

export type DeletePlotScreenProps = StackScreenProps<"DeletePlot">;

export type PlotDetailsScreenProps = StackScreenProps<"PlotDetails">;
export type PlotFertilizerApplicationsScreenProps =
  StackScreenProps<"PlotFertilizerApplications">;

export type PlotCropProtectionApplicationsScreenProps =
  StackScreenProps<"PlotCropProtectionApplications">;

export type PlotHarvestsScreenProps = StackScreenProps<"PlotHarvests">;

export type PlotTillagesScreenProps = StackScreenProps<"PlotTillages">;

export type SplitPlotOnboardingScreenProps = StackScreenProps<"SplitPlotOnboarding">;
export type SplitPlotSummaryScreenProps = StackScreenProps<"SplitPlotSummary">;
export type MergePlotSummaryScreenProps = StackScreenProps<"MergePlotSummary">;
export type PlotListScreenProps = StackScreenProps<"PlotList">;
