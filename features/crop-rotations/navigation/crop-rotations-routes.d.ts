import { NativeStackScreenProps } from "@react-navigation/native-stack";

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

  AddCropRotationSelectStartDate: undefined;
  AddCropRotationSelectCrop: undefined;
  AddCropRotationSelectPlots: undefined;
  AddCropRotationSummary: undefined;
};

export type CropRotationsScreenProps = NativeStackScreenProps<
  CropRotationsStackParamList,
  "CropRotations"
>;
export type CropRotationsOfYearListScreenProps = NativeStackScreenProps<
  CropRotationsStackParamList,
  "CropRotationsOfYearList"
>;

export type PlotCropRotationsScreenProps = NativeStackScreenProps<
  CropRotationsStackParamList,
  "PlotCropRotations"
>;

export type AddCropRotationScreenProps = NativeStackScreenProps<
  CropRotationsStackParamList,
  "AddPlotCropRotation"
>;

export type EditCropRotationScreenProps = NativeStackScreenProps<
  CropRotationsStackParamList,
  "EditPlotCropRotation"
>;

export type AddCropRotationSelectStartDateScreenProps = NativeStackScreenProps<
  CropRotationsStackParamList,
  "AddCropRotationSelectStartDate"
>;
export type AddCropRotationSelectCropScreenProps = NativeStackScreenProps<
  CropRotationsStackParamList,
  "AddCropRotationSelectCrop"
>;
export type AddCropRotationSelectPlotsScreenProps = NativeStackScreenProps<
  CropRotationsStackParamList,
  "AddCropRotationSelectPlots"
>;
export type AddCropRotationSummaryScreenProps = NativeStackScreenProps<
  CropRotationsStackParamList,
  "AddCropRotationSummary"
>;
