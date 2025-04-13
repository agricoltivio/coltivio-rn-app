import { createQueryKeys } from "@lukemorales/query-key-factory";

export const fertilizersQueryKeys = createQueryKeys("fertilizers", {
  all: null,
  byId: (fertilizerId: string) => [fertilizerId],
  inUse: (fertilizerId: string) => [fertilizerId],
});
