import { createQueryKeys } from "@lukemorales/query-key-factory";

export const harvestPresetsQueryKeys = createQueryKeys("harvestPresets", {
  all: null,
  byId: (presetId: string) => [presetId],
});
