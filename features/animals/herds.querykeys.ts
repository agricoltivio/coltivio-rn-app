import { createQueryKeys } from "@lukemorales/query-key-factory";

export const herdsQueryKeys = createQueryKeys("herds", {
  all: null,
  byId: (herdId: string) => [herdId],
  outdoorSchedules: (herdId: string) => [herdId],
});
