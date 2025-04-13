import { createQueryKeys } from "@lukemorales/query-key-factory";

export const federalParcelsQueryKeys = createQueryKeys("federalPlots", {
  bbox: (bbox: string, buffer: number) => [bbox, buffer],
  point: (point: { lat: number; lng: number }, radius: number) => [
    point,
    radius,
  ],
  farm: (federalFarmId: string, radius: number) => [federalFarmId, radius],
  federalFarmIds: (query: string, limit: number) => [query, limit],
});
