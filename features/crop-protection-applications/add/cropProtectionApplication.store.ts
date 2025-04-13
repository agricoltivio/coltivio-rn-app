import { CropProtectionApplicationsBatchCreateInput } from "@/api/cropProtectionApplications.api";
import { CropProtectionEquipment } from "@/api/cropProtectionEquipments.api";
import { CropProtectionProduct } from "@/api/cropProtectionProducts.api";
import { create } from "zustand";

export type SelectedCropProtectionApplicationPlot = {
  plotId: string;
  name: string;
  size: number;
  geometry: GeoJSON.MultiPolygon;
  numberOfApplications: number;
};

export type AddCropProtectionApplicationBase = Omit<
  CropProtectionApplicationsBatchCreateInput,
  "plots"
>;

type AddCropProtectionApplication = {
  totalNumberOfApplications?: number;
  setTotalNumberOfApplications: (amount: number) => void;
  data?: Partial<AddCropProtectionApplicationBase>;
  setData: (data: Partial<AddCropProtectionApplicationBase>) => void;
  selectedProduct?: CropProtectionProduct;
  setSelectedProduct: (product: CropProtectionProduct) => void;
  selectedEquipment?: CropProtectionEquipment;
  setSelectedEquipment: (equipment: CropProtectionEquipment) => void;
  selectedPlotsById: Record<string, SelectedCropProtectionApplicationPlot>;
  putPlot: (plot: SelectedCropProtectionApplicationPlot) => void;
  removePlot: (plotId: string) => void;
  removePlots: (plotIds: string[]) => void;
  reset: () => void;
  resetSelectedPlots: () => void;
};

export const useAddCropProtectionApplicationStore =
  create<AddCropProtectionApplication>((set) => ({
    setTotalNumberOfApplications: (amount: number) =>
      set({ totalNumberOfApplications: amount }),
    setData: (rotation) =>
      set((state) => ({
        data: {
          ...state.data,
          ...rotation,
        },
      })),
    setSelectedEquipment: (equipment) => set({ selectedEquipment: equipment }),
    setSelectedProduct: (product) => set({ selectedProduct: product }),
    selectedPlotsById: {},
    putPlot: (plot: SelectedCropProtectionApplicationPlot) =>
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
        totalNumberOfApplications: undefined,
        selectedProduct: undefined,
        selectedPlotsById: {},
        selectedEquipment: undefined,
        data: undefined,
      })),
    resetSelectedPlots: () =>
      set(() => ({
        selectedPlotsById: {},
      })),
  }));
