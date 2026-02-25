import { createQueryKeys } from "@lukemorales/query-key-factory";

export const tillagePresetsQueryKeys = createQueryKeys("tillagePresets", {
  all: null,
  byId: (presetId: string) => [presetId],
});
