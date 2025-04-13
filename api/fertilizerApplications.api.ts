import { FetchClient } from "./api";
import { components } from "./v1";

export type FertilizerApplicationBatchCreateInput =
  components["schemas"]["PostV1FertilizerApplicationsRequestBody"];

export type FertilizerApplication =
  components["schemas"]["GetV1FertilizerApplicationsByIdFertilizerApplicationIdPositiveResponse"]["data"];

export type FertilizerApplicationMethod = FertilizerApplication["method"];

export type PlotFertilizerApplication =
  components["schemas"]["GetV1PlotsByIdPlotIdFertilizerApplicationsPositiveResponse"]["data"]["result"][number];

export type FertilizerApplicationSummary =
  components["schemas"]["GetV1FertilizerApplicationsSummariesPositiveResponse"]["data"]["monthlyApplications"][0];

export function fertilizerApplicationsApi(client: FetchClient) {
  return {
    async createFertilizerApplications(
      input: FertilizerApplicationBatchCreateInput
    ): Promise<FertilizerApplication[]> {
      const { data } = await client.POST("/v1/fertilizerApplications", {
        body: input,
      });
      return data!.data.result;
    },

    async getFertilizerApplications(
      fromDate?: Date,
      toDate?: Date
    ): Promise<FertilizerApplication[]> {
      const { data } = await client.GET("/v1/fertilizerApplications", {
        params: {
          query: {
            fromDate: fromDate?.toISOString(),
            toDate: toDate?.toISOString(),
          },
        },
      });
      return data!.data.result;
    },

    async getFertilizerApplicationById(
      fertilizerApplicationId: string
    ): Promise<FertilizerApplication> {
      const { data } = await client.GET(
        "/v1/fertilizerApplications/byId/{fertilizerApplicationId}",
        {
          params: {
            path: {
              fertilizerApplicationId,
            },
          },
        }
      );
      return data!.data;
    },
    async getFertilizerApplicationsForPlot(
      plotId: string
    ): Promise<PlotFertilizerApplication[]> {
      const { data } = await client.GET(
        "/v1/plots/byId/{plotId}/fertilizerApplications",
        {
          params: {
            path: {
              plotId,
            },
          },
        }
      );
      return data!.data.result;
    },
    async deleteFertilizerApplication(fertilizerApplicationId: string) {
      await client.DELETE(
        "/v1/fertilizerApplications/byId/{fertilizerApplicationId}",
        {
          params: {
            path: {
              fertilizerApplicationId,
            },
          },
        }
      );
    },
    async getFertilizerApplicationYears(): Promise<string[]> {
      const { data } = await client.GET("/v1/fertilizerApplications/years");
      return data!.data.result;
    },
    async getFertilizerApplicationSummariesForPlot(
      plotId: string
    ): Promise<FertilizerApplicationSummary[]> {
      const { data } = await client.GET(
        "/v1/plots/byId/{plotId}/fertilizerApplicationSummary",
        {
          params: {
            path: {
              plotId,
            },
          },
        }
      );
      return data!.data.monthlyApplications ?? [];
    },

    async getFertilizerApplicationSummariesForFarm(): Promise<
      FertilizerApplicationSummary[]
    > {
      const { data } = await client.GET("/v1/fertilizerApplications/summaries");
      return data!.data.monthlyApplications ?? [];
    },
  };
}
