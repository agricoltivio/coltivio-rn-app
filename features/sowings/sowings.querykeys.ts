import { createQueryKeys } from "@lukemorales/query-key-factory";

export const sowingsQueryKeys = createQueryKeys("sowings", {
  all: null,
  byId: (sowingId: string) => [sowingId],
  byPlotId: (plotId: string) => [plotId],
  summaries: null,
  units: null,
  presets: null,
});
