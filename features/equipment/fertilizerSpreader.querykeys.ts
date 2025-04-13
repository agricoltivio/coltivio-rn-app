import { createQueryKeys } from "@lukemorales/query-key-factory";

export const fertilizerSpreadersQueryKeys = createQueryKeys(
  "fertilizerSpreaders",
  {
    all: null,
    byId: (fertilizerSpreaderId: string) => [fertilizerSpreaderId],
  }
);
