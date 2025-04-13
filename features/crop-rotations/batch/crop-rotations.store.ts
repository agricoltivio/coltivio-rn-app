import { CropRotationCreateManyInput } from "@/api/crop-rotations.api";
import { Crop } from "@/api/crops.api";
import { create } from "zustand";

export type SelectedCropRotationPlot = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
};

export type CropRotationBase = Omit<CropRotationCreateManyInput, "plotIds">;

type CreateCropRotation = {
  selectedCrop?: Crop;
  setSelectedCrop: (crop: Crop) => void;
  cropRotations?: Partial<CropRotationBase>;
  setCropRotation: (cropRotation: Partial<CropRotationBase>) => void;
  selectedPlotsById: Record<string, SelectedCropRotationPlot>;
  putPlot: (plot: SelectedCropRotationPlot) => void;
  removePlot: (plotId: string) => void;
  removePlots: (plotIds: string[]) => void;
  reset: () => void;
  resetSelectedPlots: () => void;
};

export const useCreateCropRotationStore = create<CreateCropRotation>((set) => ({
  setCropRotation: (rotation) =>
    set((state) => ({
      cropRotations: {
        ...state.cropRotations,
        ...rotation,
      },
    })),
  setSelectedCrop: (crop) => set({ selectedCrop: crop }),
  selectedPlotsById: {},
  putPlot: (plot: SelectedCropRotationPlot) =>
    set((state) => ({
      selectedPlotsById: {
        ...state.selectedPlotsById,
        [plot.plotId]: plot,
      },
    })),
  removePlot: (plotId: string) =>
    set((state) => {
      const selectedPlotsById = {
        ...state.selectedPlotsById,
      };
      delete selectedPlotsById[plotId];
      return {
        selectedPlotsById: selectedPlotsById,
      };
    }),
  removePlots: (plotIds: string[]) =>
    set((state) => {
      const selectedPlotsById = {
        ...state.selectedPlotsById,
      };
      plotIds.forEach((plotId) => {
        delete selectedPlotsById[plotId];
      });
      return {
        selectedPlotsById: selectedPlotsById,
      };
    }),
  reset: () =>
    set(() => ({
      selectedPlotsById: {},
      selectedCrop: undefined,
      totalNumberOfApplications: undefined,
      cropRotations: undefined,
    })),
  resetSelectedPlots: () =>
    set(() => ({
      selectedPlotsById: {},
    })),
}));
