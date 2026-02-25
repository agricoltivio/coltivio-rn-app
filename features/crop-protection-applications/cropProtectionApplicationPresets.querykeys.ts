import { createQueryKeys } from "@lukemorales/query-key-factory";

export const cropProtectionApplicationPresetsQueryKeys = createQueryKeys("cropProtectionApplicationPresets", {
  all: null,
  byId: (presetId: string) => [presetId],
});
