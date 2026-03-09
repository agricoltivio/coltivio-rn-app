import { createQueryKeys } from "@lukemorales/query-key-factory";

export const fieldEventsQueryKeys = createQueryKeys("fieldEvents", {
  all: (fromDate: Date, toDate: Date) => [fromDate, toDate],
});
