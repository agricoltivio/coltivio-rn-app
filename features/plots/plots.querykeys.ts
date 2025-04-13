import { createQueryKeys } from "@lukemorales/query-key-factory";

export const plotsQueryKeys = createQueryKeys("plots", {
  all: null,
  byId: (plotId: string) => [plotId],
  cropRotationById: (plotId: string, rotationId: string) => [
    plotId,
    rotationId,
  ],
});
