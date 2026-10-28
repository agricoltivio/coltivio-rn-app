import { createQueryKeys } from "@lukemorales/query-key-factory";

export const parasiteChecksQueryKeys = createQueryKeys("parasiteChecks", {
  list: null,
  byId: (checkId: string) => [checkId],
  animalHistory: (animalId: string) => [animalId],
});
