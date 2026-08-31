import { Crop } from "@/api/crops.api";
import { create } from "zustand";
import { HarvestBatchCreateInput } from "@/api/harvests.api";

export type SelectedHarvestPlot = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  harvestSize: number;
  numberOfUnits: number;
  amountInKilos: number;
};

export type Harvest = Omit<HarvestBatchCreateInput, "geometry" | "date"> & {
  date: Date;
};

type CreateHarvestStore = {
  selectedCrop?: Crop;
  setSelectedCrop: (crop: Crop) => void;
  harvest?: Partial<Harvest>;
  setHarvest: (harvest: Partial<Harvest>) => void;
  totalProducedUnits?: number;
  setTotalProducedUnits: (quantity: number) => void;
  selectedPlotsById: Record<string, SelectedHarvestPlot>;
  putHarvestPlot: (harvestPlot: SelectedHarvestPlot) => void;
  removeHarvestPlot: (plotId: string) => void;
  removeHarvestPlots: (plotIds: string[]) => void;
  // Set when the flow is launched with a plot already chosen (from the plot details
  // drawer, or the FAB on the plot-scoped harvests list) — skips the plot-picker/
  // divide screens. `returnTo` is the screen the summary screen navigates back to:
  // the map or the plot-scoped harvests list.
  preselectedPlotId?: string;
  setPreselectedPlotId: (plotId: string | undefined) => void;
  returnTo?: "PlotsMap" | "PlotHarvests";
  setReturnTo: (returnTo: "PlotsMap" | "PlotHarvests" | undefined) => void;
  reset: () => void;
  resetSelectedPlots: () => void;
};

export const useCreateHarvestStore = create<CreateHarvestStore>((set) => ({
  putHarvestPlot: (plot: SelectedHarvestPlot) =>
    set((state) => ({
      selectedPlotsById: {
        ...state.selectedPlotsById,
        [plot.plotId]: plot,
      },
    })),
  removeHarvestPlot: (plotId: string) =>
    set((state) => {
      const selectedHarvestPlotsById = {
        ...state.selectedPlotsById,
      };
      delete selectedHarvestPlotsById[plotId];
      return {
        selectedPlotsById: selectedHarvestPlotsById,
      };
    }),
  removeHarvestPlots: (plotIds: string[]) =>
    set((state) => {
      const selectedHarvestPlotsById = {
        ...state.selectedPlotsById,
      };
      plotIds.forEach((parcelId) => {
        delete selectedHarvestPlotsById[parcelId];
      });
      return {
        selectedPlotsById: selectedHarvestPlotsById,
      };
    }),
  preselectedPlotId: undefined,
  setPreselectedPlotId: (plotId) => set({ preselectedPlotId: plotId }),
  returnTo: undefined,
  setReturnTo: (returnTo) => set({ returnTo }),
  reset: () =>
    set(() => ({
      selectedPlotsById: {},
      totalProducedUnits: undefined,
      selectedCrop: undefined,
      harvest: undefined,
      preselectedPlotId: undefined,
      returnTo: undefined,
    })),
  resetSelectedPlots: () =>
    set(() => ({
      selectedPlotsById: {},
    })),
  selectedPlotsById: {},
  setTotalProducedUnits: (quantity: number) =>
    set({ totalProducedUnits: quantity }),
  setHarvest: (harvest) =>
    set((state) => ({ harvest: { ...state.harvest, ...harvest } })),
  setSelectedCrop: (forage) => set({ selectedCrop: forage }),
}));
