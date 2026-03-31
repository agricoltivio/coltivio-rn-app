import { createQueryKeys } from "@lukemorales/query-key-factory";

export const animalsQueryKeys = createQueryKeys("animals", {
  all: null,
  filtered: (onlyLiving: boolean, animalTypes?: string[]) => [
    { onlyLiving, animalTypes: animalTypes ?? null },
  ],
  living: null,
  byId: (animalId: string) => [animalId],
  children: (animalId: string) => [animalId],
  familyTree: (type: string) => [type],
});
