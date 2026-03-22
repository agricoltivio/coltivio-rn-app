import { createQueryKeys } from "@lukemorales/query-key-factory";

export const cropProtectionApplicationsQueryKeys = createQueryKeys(
  "cropProtectionApplications",
  {
    all: null,
    byId: (applicationId: string) => [applicationId],
    byPlotId: (plotId: string) => [plotId],
    years: null,
    summaries: null,
    summariesByPlotId: (plotId: string) => ["summaries", plotId],
  },
);
