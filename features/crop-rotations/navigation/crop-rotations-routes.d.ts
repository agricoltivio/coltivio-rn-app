import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropRotationsStackParamList = {
  CropRotations: undefined;
  CropRotationsOfYearList: { year: number };
  PlotCropRotations: { plotId: string; name: string };
  AddPlotCropRotation: { plotId: string };
  EditPlotCropRotation: {
    plotName?: string;
    rotationId: string;
    canDelete?: boolean;
  };

  AddCropRotationSelectCrop: undefined;
  AddCropRotationSelectPlots: undefined;
  AddCropRotationSummary: undefined;
};

export type CropRotationsScreenProps = StackScreenProps<"CropRotations">;
export type CropRotationsOfYearListScreenProps =
  StackScreenProps<"CropRotationsOfYearList">;

export type PlotCropRotationsScreenProps =
  StackScreenProps<"PlotCropRotations">;

export type AddCropRotationScreenProps =
  StackScreenProps<"AddPlotCropRotation">;

export type EditCropRotationScreenProps =
  StackScreenProps<"EditPlotCropRotation">;

export type AddCropRotationSelectCropScreenProps =
  StackScreenProps<"AddCropRotationSelectCrop">;
export type AddCropRotationSelectPlotsScreenProps =
  StackScreenProps<"AddCropRotationSelectPlots">;
export type AddCropRotationSummaryScreenProps =
  StackScreenProps<"AddCropRotationSummary">;
