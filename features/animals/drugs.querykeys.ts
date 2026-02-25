import { createQueryKeys } from "@lukemorales/query-key-factory";

export const drugsQueryKeys = createQueryKeys("drugs", {
  all: null,
  byId: (drugId: string) => [drugId],
});
