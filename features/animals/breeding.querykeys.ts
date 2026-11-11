import { createQueryKeys } from "@lukemorales/query-key-factory";

export const breedingQueryKeys = createQueryKeys("breeding", {
  weights: (animalId: string) => [animalId],
  heats: (animalId: string) => [animalId],
  calendar: (from: string, to: string) => [{ from, to }],
  gestationSettings: null,
});
