import { createQueryKeys } from "@lukemorales/query-key-factory";

export const wikiQueryKeys = createQueryKeys("wiki", {
  publicList: null,
  myEntries: null,
  byId: (entryId: string) => [entryId],
  categories: null,
  myChangeRequests: null,
  changeRequestNotes: (changeRequestId: string) => [changeRequestId],
});
