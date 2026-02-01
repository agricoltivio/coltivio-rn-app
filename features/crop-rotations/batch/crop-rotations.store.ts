import { Crop } from "@/api/crops.api";
import { create } from "zustand";

export type SelectedCropRotationPlot = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
};

export type PlotDates = {
  fromDate: string;
  toDate: string;
};

type CreateCropRotation = {
  selectedCrop?: Crop;
  setSelectedCrop: (crop: Crop) => void;
  cropId?: string;
  setCropId: (id: string) => void;
  plotDatesById: Record<string, PlotDates>;
  setPlotDate: (plotId: string, fromDate: string, toDate: string) => void;
  setAllPlotDates: (fromDate: string, toDate: string) => void;
  selectedPlotsById: Record<string, SelectedCropRotationPlot>;
  putPlot: (plot: SelectedCropRotationPlot) => void;
  removePlot: (plotId: string) => void;
  removePlots: (plotIds: string[]) => void;
  reset: () => void;
  resetSelectedPlots: () => void;
};

export const useCreateCropRotationStore = create<CreateCropRotation>((set) => ({
  setCropId: (id) => set({ cropId: id }),
  setSelectedCrop: (crop) => set({ selectedCrop: crop }),
  plotDatesById: {},
  setPlotDate: (plotId, fromDate, toDate) =>
    set((state) => ({
      plotDatesById: {
        ...state.plotDatesById,
        [plotId]: { fromDate, toDate },
      },
    })),
  setAllPlotDates: (fromDate, toDate) =>
    set((state) => {
      const plotDatesById: Record<string, PlotDates> = {};
      for (const plotId of Object.keys(state.selectedPlotsById)) {
        plotDatesById[plotId] = { fromDate, toDate };
      }
      return { plotDatesById };
    }),
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
      cropId: undefined,
      plotDatesById: {},
    })),
  resetSelectedPlots: () =>
    set(() => ({
      selectedPlotsById: {},
    })),
}));
