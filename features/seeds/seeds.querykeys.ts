import { createQueryKeys } from "@lukemorales/query-key-factory";

export const seedsQueryKeys = createQueryKeys("seeds", {
  all: null,
  byId: (seedId: string) => [seedId],
  inUse: (seedId: string) => [seedId],
});
