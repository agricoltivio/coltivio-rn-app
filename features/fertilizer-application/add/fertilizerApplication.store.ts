import { FertilizerSpreader } from "@/api/fertilizerSpreaders.api";
import { FertilizerApplicationBatchCreateInput } from "@/api/fertilizerApplications.api";
import { Fertilizer } from "@/api/fertilizers.api";
import { create } from "zustand";

export type SelectedFertilizerApplicationPlot = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  size: number;
  numberOfApplications: number;
};

export type FertilizerApplication = Omit<
  FertilizerApplicationBatchCreateInput,
  "plots" | "geometry"
>;
type CreateFertilizerApplicationStore = {
  selectedSpreader?: FertilizerSpreader;
  setSelectedSpreader: (machine: FertilizerSpreader) => void;
  selectedFertilizer?: Fertilizer;
  setSelectedFertilizer: (fertilizer: Fertilizer) => void;
  fertilizerApplication?: Partial<FertilizerApplication>;
  setFertilizerApplication: (
    fertilizerApplication: Partial<FertilizerApplication>
  ) => void;
  totalNumberOfApplications?: number;
  setTotalNumberOfApplications: (quantity: number) => void;
  selectedPlotsById: Record<string, SelectedFertilizerApplicationPlot>;
  putPlot: (plot: SelectedFertilizerApplicationPlot) => void;
  removePlot: (plotId: string) => void;
  removePlots: (plotIds: string[]) => void;
  reset: () => void;
  resetSelectedPlots: () => void;
};

export const useCreateFertilizerApplicationStore =
  create<CreateFertilizerApplicationStore>((set) => ({
    setTotalNumberOfApplications: (quantity: number) =>
      set({ totalNumberOfApplications: quantity }),
    setFertilizerApplication: (application) =>
      set((state) => ({
        fertilizerApplication: {
          ...state.fertilizerApplication,
          ...application,
        },
      })),
    setSelectedSpreader: (spreader) => set({ selectedSpreader: spreader }),
    setSelectedFertilizer: (fertilizer) =>
      set({ selectedFertilizer: fertilizer }),
    selectedPlotsById: {},
    putPlot: (plot: SelectedFertilizerApplicationPlot) =>
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
        fertilizerApplication: undefined,
        selectedFertilizer: undefined,
        selectedSpreader: undefined,
        totalNumberOfApplications: undefined,
      })),
    resetSelectedPlots: () =>
      set(() => ({
        selectedPlotsById: {},
      })),
  }));
