import { createQueryKeys } from "@lukemorales/query-key-factory";

export const farmParcelsQueryKeys = createQueryKeys("farmParcels", {
  all: null,
  byId: (parcelId: string) => [parcelId],
});
