import { createQueryKeys } from "@lukemorales/query-key-factory";

export const cropProtectionProductsQueryKeys = createQueryKeys(
  "cropProtectionProducts",
  {
    all: null,
    byId: (cropProtectionProductId: string) => [cropProtectionProductId],
    inUse: (cropProtectionProductId: string) => [cropProtectionProductId],
  },
);
