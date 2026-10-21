import { createQueryKeys } from "@lukemorales/query-key-factory";

export const meadowsQueryKeys = createQueryKeys("meadows", {
  all: null,
  // Active and archived meadows, for the list screen
  allIncludingArchived: null,
  byId: (meadowId: string) => [meadowId],
  usage: (meadowId: string, fromDate: string, toDate: string) => [
    meadowId,
    fromDate,
    toDate,
  ],
});
