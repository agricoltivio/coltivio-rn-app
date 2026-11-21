import { createQueryKeys } from "@lukemorales/query-key-factory";

export const sowingsQueryKeys = createQueryKeys("sowings", {
  all: (fromDate?: Date, toDate?: Date) => [fromDate, toDate],
  byId: (sowingId: string) => [sowingId],
  byPlotId: (plotId: string) => [plotId],
  summaries: null,
  summariesByPlotId: (plotId: string) => ["summaries", plotId],
  units: null,
  presets: null,
});
