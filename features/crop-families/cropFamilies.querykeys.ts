import { createQueryKeys } from "@lukemorales/query-key-factory";

export const cropFamiliesQueryKeys = createQueryKeys("cropFamilies", {
  all: null,
  byId: (familyId: string) => [familyId],
  inUse: (familyId: string) => [familyId],
});
