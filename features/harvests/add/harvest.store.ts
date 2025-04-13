import { Crop } from "@/api/crops.api";
import { create } from "zustand";
import { HarvestingMachinery } from "@/api/harvestingMachinery.api";
import { HarvestBatchCreateInput } from "@/api/harvests.api";

export type SelectedHarvestPlot = {
  plotId: string;
  name: string;
  harvestArea: GeoJSON.MultiPolygon;
  harvestSize: number;
  producedUnits: number;
  amountInKilos: number;
};

export type Harvest = Omit<HarvestBatchCreateInput, "geometry"> & {
  kilosPerUnit: number;
};

type CreateHarvestStore = {
  selectedHarvestingMachinery?: HarvestingMachinery;
  setSelectedHarvestingMachinery: (
    harvestingMachinery: HarvestingMachinery
  ) => void;
  selectedCrop?: Crop;
  setSelectedCrop: (crop: Crop) => void;
  harvest?: Partial<Harvest>;
  setHarvest: (harvest: Partial<Harvest>) => void;
  totalProducedUnits?: number;
  setTotalProducedUnits: (quantity: number) => void;
  selectedHarvestPlotsById: Record<string, SelectedHarvestPlot>;
  putHarvestPlot: (harvestPlot: SelectedHarvestPlot) => void;
  removeHarvestPlot: (plotId: string) => void;
  removeHarvestPlots: (plotIds: string[]) => void;
  reset: () => void;
  resetSelectedHarvestPlots: () => void;
};

export const useCreateHarvestStore = create<CreateHarvestStore>((set) => ({
  putHarvestPlot: (plot: SelectedHarvestPlot) =>
    set((state) => ({
      selectedHarvestPlotsById: {
        ...state.selectedHarvestPlotsById,
        [plot.plotId]: plot,
      },
    })),
  removeHarvestPlot: (plotId: string) =>
    set((state) => {
      const selectedHarvestPlotsById = {
        ...state.selectedHarvestPlotsById,
      };
      delete selectedHarvestPlotsById[plotId];
      return {
        selectedHarvestPlotsById: selectedHarvestPlotsById,
      };
    }),
  removeHarvestPlots: (plotIds: string[]) =>
    set((state) => {
      const selectedHarvestPlotsById = {
        ...state.selectedHarvestPlotsById,
      };
      plotIds.forEach((parcelId) => {
        delete selectedHarvestPlotsById[parcelId];
      });
      return {
        selectedHarvestPlotsById,
      };
    }),
  reset: () =>
    set(() => ({
      selectedHarvestPlotsById: {},
      totalProducedUnits: undefined,
      selectedHarvestingMachinery: undefined,
      selectedCrop: undefined,
      harvest: undefined,
    })),
  resetSelectedHarvestPlots: () =>
    set(() => ({
      selectedHarvestPlotsById: {},
    })),
  selectedHarvestPlotsById: {},
  setTotalProducedUnits: (quantity: number) =>
    set({ totalProducedUnits: quantity }),
  setHarvest: (harvest) =>
    set((state) => ({ harvest: { ...state.harvest, ...harvest } })),
  setSelectedHarvestingMachinery: (harvestingMachinery) =>
    set({ selectedHarvestingMachinery: harvestingMachinery }),
  setSelectedCrop: (forage) => set({ selectedCrop: forage }),
}));
