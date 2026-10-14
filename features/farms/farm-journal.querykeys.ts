import { createQueryKeys } from "@lukemorales/query-key-factory";

export const farmJournalQueryKeys = createQueryKeys("farmJournal", {
  list: null,
  byEntryId: (entryId: string) => [entryId],
});
