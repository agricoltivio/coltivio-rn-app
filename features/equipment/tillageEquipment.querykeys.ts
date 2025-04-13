import { createQueryKeys } from "@lukemorales/query-key-factory";

export const tillageEquipmentQueryKeys = createQueryKeys("tillageEquipments", {
  all: null,
  byId: (equipmentId: string) => [equipmentId],
});
