import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropRotationsStackParamList = {
  CropRotations: undefined;
  CropRotationsOfYearList: { year: number };
  PlotCropRotations: { plotId: string; name: string };
  EditPlotCropRotation: {
    plotName?: string;
    rotationId: string;
  };

  PlanCropRotations: { plotIds: string[] };
  SelectPlotsForPlan: undefined;
};

export type CropRotationsScreenProps = StackScreenProps<"CropRotations">;
export type CropRotationsOfYearListScreenProps =
  StackScreenProps<"CropRotationsOfYearList">;

export type PlotCropRotationsScreenProps =
  StackScreenProps<"PlotCropRotations">;

export type EditCropRotationScreenProps =
  StackScreenProps<"EditPlotCropRotation">;

export type PlanCropRotationsScreenProps =
  StackScreenProps<"PlanCropRotations">;
export type SelectPlotsForPlanScreenProps =
  StackScreenProps<"SelectPlotsForPlan">;
