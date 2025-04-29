import { createQueryKeys } from "@lukemorales/query-key-factory";

export const cropsQueryKeys = createQueryKeys("crops", {
  all: null,
  byId: (cropId: string) => [cropId],
  inUse: (cropId: string) => [cropId],
});
