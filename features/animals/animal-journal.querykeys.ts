import { createQueryKeys } from "@lukemorales/query-key-factory";

export const animalJournalQueryKeys = createQueryKeys("animalJournal", {
  byAnimalId: (animalId: string) => [animalId],
  byEntryId: (entryId: string) => [entryId],
});
