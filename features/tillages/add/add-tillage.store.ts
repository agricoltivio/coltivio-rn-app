import { TillageEquipment } from "@/api/tillageEquipment.api";
import { TillagesBatchCreateInput } from "@/api/tillages.api";
import { create } from "zustand";

export type SelectedTillagePlot = {
  plotId: string;
  name: string;
  size: number;
  geometry: GeoJSON.MultiPolygon;
};

export type TillageBase = Omit<TillagesBatchCreateInput, "plots" | "date"> & {
  date: Date;
};

type AddTillage = {
  data?: Partial<TillageBase>;
  setData: (data: Partial<TillageBase>) => void;
  selectedEquipment?: TillageEquipment;
  setSelectedEquipment: (equipment: TillageEquipment) => void;
  selectedPlotsById: Record<string, SelectedTillagePlot>;
  putPlot: (plot: SelectedTillagePlot) => void;
  removePlot: (plotId: string) => void;
  removePlots: (plotIds: string[]) => void;
  reset: () => void;
  resetSelectedPlots: () => void;
};

export const useAddTillageStore = create<AddTillage>((set) => ({
  setData: (rotation) =>
    set((state) => ({
      data: {
        ...state.data,
        ...rotation,
      },
    })),
  setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),
  selectedPlotsById: {},
  putPlot: (plot: SelectedTillagePlot) =>
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
      selectedEquipment: undefined,
      totalNumberOfApplications: undefined,
      data: undefined,
    })),
  resetSelectedPlots: () =>
    set(() => ({
      selectedPlotsById: {},
    })),
}));
