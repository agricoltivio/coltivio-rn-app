import { create } from "zustand";

export type SubPlotData = {
  geometry: GeoJSON.MultiPolygon;
  size: number;
};

type SplitPlotStore = {
  subPlots: SubPlotData[];
  originalPlotName: string;
  setData: (subPlots: SubPlotData[], originalPlotName: string) => void;
  reset: () => void;
};

export const useSplitPlotStore = create<SplitPlotStore>((set) => ({
  subPlots: [],
  originalPlotName: "",
  setData: (subPlots, originalPlotName) => set({ subPlots, originalPlotName }),
  reset: () => set({ subPlots: [], originalPlotName: "" }),
}));
