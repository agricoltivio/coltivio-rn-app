import { createQueryKeys } from "@lukemorales/query-key-factory";

export const tillagesQueryKeys = createQueryKeys("tillages", {
  all: (fromDate?: Date, toDate?: Date) => [fromDate, toDate],
  byId: (harvestId: string) => [harvestId],
  byPlotId: (plotId: string) => [plotId],
  summaries: null,
  summariesByPlotId: (plotId: string) => ["summaries", plotId],
  years: null,
});
