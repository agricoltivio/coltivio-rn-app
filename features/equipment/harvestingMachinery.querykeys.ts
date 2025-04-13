import { createQueryKeys } from "@lukemorales/query-key-factory";

export const harvestingMachineryQueryKeys = createQueryKeys(
  "harvestingMachinery",
  {
    all: null,
    byId: (harvestingMachineryId: string) => [harvestingMachineryId],
  }
);
