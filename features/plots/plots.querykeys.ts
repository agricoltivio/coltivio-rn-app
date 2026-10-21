import { createQueryKeys } from "@lukemorales/query-key-factory";

export const plotsQueryKeys = createQueryKeys("plots", {
  all: null,
  // Active and archived plots, for the list screen
  allIncludingArchived: null,
  byId: (plotId: string) => [plotId],
  cropRotationById: (plotId: string, rotationId: string) => [
    plotId,
    rotationId,
  ],
});
