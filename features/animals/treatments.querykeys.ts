import { createQueryKeys } from "@lukemorales/query-key-factory";

export const treatmentsQueryKeys = createQueryKeys("treatments", {
  all: null,
  byId: (treatmentId: string) => [treatmentId],
  byAnimal: (animalId: string) => [animalId],
});
