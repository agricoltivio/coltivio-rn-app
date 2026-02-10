import { CropProtectionApplicationsBatchCreateInput } from "@/api/cropProtectionApplications.api";
import { CropProtectionProduct } from "@/api/cropProtectionProducts.api";
import { create } from "zustand";

export type SelectedCropProtectionApplicationPlot = {
  plotId: string;
  name: string;
  size: number;
  geometry: GeoJSON.MultiPolygon;
  numberOfUnits: number;
};

// Store uses Date objects for date/time, merged to dateTime string on save
export type AddCropProtectionApplicationData = Omit<
  CropProtectionApplicationsBatchCreateInput,
  "plots" | "dateTime"
> & {
  date: Date;
  time: Date;
};

type AddCropProtectionApplication = {
  totalNumberOfUnits?: number;
  setTotalNumberOfUnits: (amount: number) => void;
  data?: Partial<AddCropProtectionApplicationData>;
  setData: (data: Partial<AddCropProtectionApplicationData>) => void;
  selectedProduct?: CropProtectionProduct;
  setSelectedProduct: (product: CropProtectionProduct) => void;
  selectedPlotsById: Record<string, SelectedCropProtectionApplicationPlot>;
  putPlot: (plot: SelectedCropProtectionApplicationPlot) => void;
  removePlot: (plotId: string) => void;
  removePlots: (plotIds: string[]) => void;
  reset: () => void;
  resetSelectedPlots: () => void;
};

export const useAddCropProtectionApplicationStore =
  create<AddCropProtectionApplication>((set) => ({
    setTotalNumberOfUnits: (amount: number) =>
      set({ totalNumberOfUnits: amount }),
    setData: (rotation) =>
      set((state) => ({
        data: {
          ...state.data,
          ...rotation,
        },
      })),
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
        totalNumberOfUnits: undefined,
        selectedProduct: undefined,
        selectedPlotsById: {},
        data: undefined,
      })),
    resetSelectedPlots: () =>
      set(() => ({
        selectedPlotsById: {},
      })),
  }));
