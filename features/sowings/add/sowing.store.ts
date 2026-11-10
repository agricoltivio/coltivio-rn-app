import { Crop } from "@/api/crops.api";
import { Seed } from "@/api/seeds.api";
import { SowingUnit } from "@/api/sowings.api";
import { create } from "zustand";
import { SowingReturnTo } from "../navigation/sowing-routes";

export type SelectedSowingPlot = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  size: number;
  // per-area units: the rate, total units: this plot's share of the total
  amount: number;
};

export type SowingDraft = {
  date: Date;
  cropId: string;
  seedId?: string;
  unit: SowingUnit;
  amount: number;
  additionalNotes?: string;
};

type CreateSowingStore = {
  selectedCrop?: Crop;
  selectedSeed?: Seed;
  setSelection: (crop: Crop, seed: Seed | undefined) => void;
  sowing?: Partial<SowingDraft>;
  setSowing: (sowing: Partial<SowingDraft>) => void;
  selectedPlotsById: Record<string, SelectedSowingPlot>;
  putSowingPlot: (plot: SelectedSowingPlot) => void;
  removeSowingPlot: (plotId: string) => void;
  resetSelectedPlots: () => void;
  // Set when the flow is launched with a plot already chosen, skips the plot picker
  // and divide screens. `returnTo` is where the summary navigates back to.
  preselectedPlotId?: string;
  setPreselectedPlotId: (plotId: string | undefined) => void;
  returnTo?: SowingReturnTo;
  setReturnTo: (returnTo: SowingReturnTo | undefined) => void;
  reset: () => void;
};

export const useCreateSowingStore = create<CreateSowingStore>((set) => ({
  setSelection: (crop, seed) => set({ selectedCrop: crop, selectedSeed: seed }),
  setSowing: (sowing) =>
    set((state) => ({ sowing: { ...state.sowing, ...sowing } })),
  selectedPlotsById: {},
  putSowingPlot: (plot) =>
    set((state) => ({
      selectedPlotsById: { ...state.selectedPlotsById, [plot.plotId]: plot },
    })),
  removeSowingPlot: (plotId) =>
    set((state) => {
      const selectedPlotsById = { ...state.selectedPlotsById };
      delete selectedPlotsById[plotId];
      return { selectedPlotsById };
    }),
  resetSelectedPlots: () => set({ selectedPlotsById: {} }),
  preselectedPlotId: undefined,
  setPreselectedPlotId: (plotId) => set({ preselectedPlotId: plotId }),
  returnTo: undefined,
  setReturnTo: (returnTo) => set({ returnTo }),
  reset: () =>
    set({
      selectedCrop: undefined,
      selectedSeed: undefined,
      sowing: undefined,
      selectedPlotsById: {},
      preselectedPlotId: undefined,
      returnTo: undefined,
    }),
}));
