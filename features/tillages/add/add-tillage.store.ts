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
  // Set when the flow is launched with a plot already chosen (from the plot details
  // drawer, or the FAB on the plot-scoped tillages list) — skips the plot-picker
  // screen. `returnTo` is the screen the summary screen navigates back to: the map
  // or the plot-scoped tillages list.
  preselectedPlotId?: string;
  setPreselectedPlotId: (plotId: string | undefined) => void;
  returnTo?: "PlotsMap" | "PlotTillages";
  setReturnTo: (returnTo: "PlotsMap" | "PlotTillages" | undefined) => void;
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
  returnTo: undefined,
  setReturnTo: (returnTo) => set({ returnTo }),
  reset: () =>
    set(() => ({
      selectedPlotsById: {},
      data: undefined,
      preselectedPlotId: undefined,
      returnTo: undefined,
    })),
  resetSelectedPlots: () =>
    set(() => ({
      selectedPlotsById: {},
    })),
}));
