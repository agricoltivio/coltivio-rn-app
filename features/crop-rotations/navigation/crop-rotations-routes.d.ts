import { StackScreenProps } from "@/navigation/rootStackTypes";

export type CropRotationsStackParamList = {
  CropRotations: undefined;
  CropRotationsOfYearList: { year: number };
  EditPlotCropRotation: {
    plotName?: string;
    rotationId: string;
  };

  PlanCropRotations: { plotIds?: string[]; previousScreen?: "PlotDetails" };
  SelectPlotsForPlan: { draftPlanId?: string };

  DraftPlans: undefined;
  DraftPlanDetail: { draftPlanId: string };
  CreateDraftPlan: undefined;
  AddPlotsToDraft: { draftPlanId: string };
  PlanDraftRotations: { draftPlanId: string; plotIds: string[] };
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

export type DraftPlansScreenProps = StackScreenProps<"DraftPlans">;
export type DraftPlanDetailScreenProps = StackScreenProps<"DraftPlanDetail">;
export type CreateDraftPlanScreenProps = StackScreenProps<"CreateDraftPlan">;
export type AddPlotsToDraftScreenProps = StackScreenProps<"AddPlotsToDraft">;
export type PlanDraftRotationsScreenProps =
  StackScreenProps<"PlanDraftRotations">;
