import { createQueryKeys } from "@lukemorales/query-key-factory";

export const plotJournalQueryKeys = createQueryKeys("plotJournal", {
  byPlotId: (plotId: string) => [plotId],
  byEntryId: (entryId: string) => [entryId],
});
