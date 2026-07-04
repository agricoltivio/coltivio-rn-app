import { createQueryKeys } from "@lukemorales/query-key-factory";

export const wikiQueryKeys = createQueryKeys("wiki", {
  myEntries: null,
  byId: (entryId: string) => [entryId],
  categories: null,
});
