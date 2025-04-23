import { create } from "zustand";

export type AddPlotStoreData = {
  geometry: GeoJSON.MultiPolygon;
  centroid: GeoJSON.Point;
  size: number;
  usage?: number;
  localId?: string;
  cuttingDate?: string;
};

export type AddPlotStore = {
  data?: AddPlotStoreData;
  setData: (data: AddPlotStoreData) => void;
  reset: () => void;
};

export const useAddPlotStore = create<AddPlotStore>((set) => ({
  setData: (data) => set({ data }),
  reset: () => set({ data: undefined }),
}));
