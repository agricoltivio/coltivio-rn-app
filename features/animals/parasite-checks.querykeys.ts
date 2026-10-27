import { createQueryKeys } from "@lukemorales/query-key-factory";

export const parasiteChecksQueryKeys = createQueryKeys("parasiteChecks", {
  list: (herdId?: string) => [herdId],
  byId: (checkId: string) => [checkId],
  animalHistory: (animalId: string) => [animalId],
  herdOverview: (herdId: string) => [herdId],
});
