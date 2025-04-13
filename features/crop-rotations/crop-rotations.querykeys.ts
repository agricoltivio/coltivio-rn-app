import { createQueryKeys } from "@lukemorales/query-key-factory";

export const cropRotationsQueryKeys = createQueryKeys("cropRotations", {
  all: (fromDate?: Date, toDate?: Date) => [fromDate, toDate],
  byId: (plotId: string) => [plotId],
  years: null,
});
