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
  selectedPlotsById: Record<string, SelectedTillagePlot>;
  putPlot: (plot: SelectedTillagePlot) => void;
  removePlot: (plotId: string) => void;
  removePlots: (plotIds: string[]) => void;
  // Set when the flow is launched from the plot details drawer with a plot already
  // chosen — skips the plot-picker screen and routes the summary screen back to
  // the map instead of the tillages list.
  preselectedPlotId?: string;
  setPreselectedPlotId: (plotId: string | undefined) => void;
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
  preselectedPlotId: undefined,
  setPreselectedPlotId: (plotId) => set({ preselectedPlotId: plotId }),
  reset: () =>
    set(() => ({
      selectedPlotsById: {},
      data: undefined,
      preselectedPlotId: undefined,
    })),
  resetSelectedPlots: () =>
    set(() => ({
      selectedPlotsById: {},
    })),
}));
