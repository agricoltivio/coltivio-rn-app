import { FetchClient } from "./api";
import { components } from "./v1";

export type Harvest =
  components["schemas"]["GetV1HarvestsPositiveResponse"]["data"]["result"][number];

export type HarvestUnit = Harvest["unit"];
export type ConservationMethod = NonNullable<Harvest["conservationMethod"]>;

export type PlotHarvest =
  components["schemas"]["GetV1PlotsByIdPlotIdHarvestsPositiveResponse"]["data"]["result"][number];

export type HarvestBatchCreateInput =
  components["schemas"]["PostV1HarvestsBatchRequestBody"];

export type HarvestSummary =
  components["schemas"]["GetV1HarvestsSummariesPositiveResponse"]["data"]["monthlyHarvests"][number];

export function harvestsApi(client: FetchClient) {
  return {
    async createHarvests(harvests: HarvestBatchCreateInput) {
      const { data } = await client.POST("/v1/harvests/batch", {
        body: harvests,
      });
      return data!.data.result;
    },
    async getHarvests(fromDate?: Date, toDate?: Date): Promise<Harvest[]> {
      const { data } = await client.GET("/v1/harvests", {
        params: {
          query: {
            fromDate: fromDate?.toISOString(),
            toDate: toDate?.toISOString(),
          },
        },
      });
      return data!.data.result;
    },

    async getHarvestSummaries(): Promise<HarvestSummary[]> {
      const { data } = await client.GET("/v1/harvests/summaries");
      return data!.data.monthlyHarvests ?? [];
    },

    async getHarvestById(harvestId: string): Promise<Harvest> {
      const { data } = await client.GET("/v1/harvests/byId/{harvestId}", {
        params: {
          path: {
            harvestId,
          },
        },
      });
      return data!.data;
    },
    async getPlotHarvests(plotId: string): Promise<PlotHarvest[]> {
      const { data } = await client.GET("/v1/plots/byId/{plotId}/harvests", {
        params: {
          path: {
            plotId,
          },
        },
      });
      return data!.data.result;
    },

    async getPlotHarvestSummaries(plotId: string) {
      const { data } = await client.GET(
        "/v1/plots/byId/{plotId}/harvestSummary",
        {
          params: { path: { plotId } },
        },
      );
      return data!.data.monthlyHarvests ?? [];
    },
    async deleteHarvest(harvestId: string) {
      await client.DELETE("/v1/harvests/byId/{harvestId}", {
        params: {
          path: {
            harvestId,
          },
        },
      });
    },
    async getHarvestYears(): Promise<string[]> {
      const { data } = await client.GET("/v1/harvests/years");
      return data!.data.result;
    },
  };
}
