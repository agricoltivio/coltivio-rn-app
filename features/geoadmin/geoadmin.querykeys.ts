import { createQueryKeys } from "@lukemorales/query-key-factory";

export const geoAdminQueryKeys = createQueryKeys("geoadmin", {
  addresses: (searchText: string) => [searchText],
});
