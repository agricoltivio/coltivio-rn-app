import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropRotationsStackParamList = {
  CropRotations: undefined;
  CropRotationsOfYearList: { year: number };
  EditPlotCropRotation: {
    plotName?: string;
    rotationId: string;
  };

  PlanCropRotations: { plotIds?: string[]; previousScreen?: "PlotDetails" };
  SelectPlotsForPlan: undefined;
};

export type CropRotationsScreenProps = StackScreenProps<"CropRotations">;
export type CropRotationsOfYearListScreenProps =
  StackScreenProps<"CropRotationsOfYearList">;

export type EditCropRotationScreenProps =
  StackScreenProps<"EditPlotCropRotation">;

export type PlanCropRotationsScreenProps =
  StackScreenProps<"PlanCropRotations">;
export type SelectPlotsForPlanScreenProps =
  StackScreenProps<"SelectPlotsForPlan">;
