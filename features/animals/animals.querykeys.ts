import { createQueryKeys } from "@lukemorales/query-key-factory";

export const animalsQueryKeys = createQueryKeys("animals", {
  all: null,
  living: null,
  byId: (animalId: string) => [animalId],
  children: (animalId: string) => [animalId],
});
