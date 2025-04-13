import { createQueryKeys } from "@lukemorales/query-key-factory";

export const cropProtectionEquipmentsQueryKeys = createQueryKeys(
  "cropProtectionEquipments",
  {
    all: null,
    byId: (cropProtectionEquipmentId: string) => [cropProtectionEquipmentId],
  }
);
