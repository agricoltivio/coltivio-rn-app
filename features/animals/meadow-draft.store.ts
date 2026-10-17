import { create } from "zustand";

export type MeadowDraftData = {
  geometry: GeoJSON.MultiPolygon;
  size: number;
};

export type MeadowDraftStore = {
  data?: MeadowDraftData;
  setData: (data: MeadowDraftData) => void;
  reset: () => void;
};

export const useMeadowDraftStore = create<MeadowDraftStore>((set) => ({
  setData: (data) => set({ data }),
  reset: () => set({ data: undefined }),
}));
