import { createQueryKeys } from "@lukemorales/query-key-factory";

export const outdoorJournalQueryKeys = createQueryKeys("outdoorJournal", {
  byDateRange: (fromDate: string, toDate: string) => [fromDate, toDate],
});
