import { createQueryKeys } from "@lukemorales/query-key-factory";

export const cropRotationsQueryKeys = createQueryKeys("cropRotations", {
  all: (fromDate?: Date, toDate?: Date) => [fromDate, toDate],
  byId: (plotId: string) => [plotId],
  byPlotIds: (
    plotIds: string[],
    onlyCurrent: boolean,
    expand: boolean = true,
    includeRecurrence: boolean = false,
  ) => [plotIds, onlyCurrent, expand, includeRecurrence],
  years: null,
  draftPlans: null,
  draftPlanById: (draftPlanId: string) => [draftPlanId],
});
