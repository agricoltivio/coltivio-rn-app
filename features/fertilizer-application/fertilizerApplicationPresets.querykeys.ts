import { createQueryKeys } from "@lukemorales/query-key-factory";

export const fertilizerApplicationPresetsQueryKeys = createQueryKeys(
  "fertilizerApplicationPresets",
  {
    all: null,
    byId: (presetId: string) => [presetId],
  },
);
