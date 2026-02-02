import { Crop } from "@/api/crops.api";
import { create } from "zustand";
import { HarvestingMachinery } from "@/api/harvestingMachinery.api";
import { HarvestBatchCreateInput } from "@/api/harvests.api";

export type SelectedHarvestPlot = {
  plotId: string;
  name: string;
  geometry: GeoJSON.MultiPolygon;
  harvestSize: number;
  producedUnits: number;
  amountInKilos: number;
};

export type Harvest = Omit<HarvestBatchCreateInput, "geometry" | "date"> & {
  kilosPerUnit: number;
  date: Date;
};

type CreateHarvestStore = {
  selectedHarvestingMachinery?: HarvestingMachinery;
  setSelectedHarvestingMachinery: (
    harvestingMachinery: HarvestingMachinery,
  ) => void;
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
  reset: () =>
    set(() => ({
      selectedPlotsById: {},
      totalProducedUnits: undefined,
      selectedHarvestingMachinery: undefined,
      selectedCrop: undefined,
      harvest: undefined,
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
  setSelectedHarvestingMachinery: (harvestingMachinery) =>
    set({ selectedHarvestingMachinery: harvestingMachinery }),
  setSelectedCrop: (forage) => set({ selectedCrop: forage }),
}));
