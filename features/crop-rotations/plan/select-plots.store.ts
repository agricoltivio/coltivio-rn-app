import { Plot } from "@/api/plots.api";
import { create } from "zustand";

type SelectPlotsStore = {
  selectedPlotsById: Record<string, Plot>;
  putPlot: (plot: Plot) => void;
  removePlot: (plotId: string) => void;
  resetSelectedPlots: () => void;
};

export const useSelectPlotsStore = create<SelectPlotsStore>((set) => ({
  selectedPlotsById: {},
  putPlot: (plot: Plot) =>
    set((state) => ({
      selectedPlotsById: {
        ...state.selectedPlotsById,
        [plot.id]: plot,
      },
    })),
  removePlot: (plotId: string) =>
    set((state) => {
      const selectedPlotsById = { ...state.selectedPlotsById };
      delete selectedPlotsById[plotId];
      return { selectedPlotsById };
    }),
  resetSelectedPlots: () =>
    set(() => ({
      selectedPlotsById: {},
    })),
}));
