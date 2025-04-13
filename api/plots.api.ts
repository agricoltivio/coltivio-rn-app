import { FetchClient } from "./api";
import { components } from "./v1";

export type Plot =
  components["schemas"]["GetV1PlotsByIdPlotIdPositiveResponse"]["data"];

export type PlotCreateInput = components["schemas"]["PostV1PlotsRequestBody"];
export type PlotUpdateInput =
  components["schemas"]["PatchV1PlotsByIdPlotIdRequestBody"];

export function plotsApi(client: FetchClient) {
  return {
    async getPlots(): Promise<Plot[]> {
      const { data } = await client.GET("/v1/plots");
      return data!.data.result;
    },
    async getPlotById(plotId: string): Promise<Plot> {
      const { data } = await client.GET("/v1/plots/byId/{plotId}", {
        params: {
          path: {
            plotId,
          },
        },
      });
      return data!.data;
    },
    async createPlot(plot: PlotCreateInput): Promise<Plot> {
      const { data } = await client.POST("/v1/plots", {
        body: plot,
      });
      return data!.data;
    },
    async updatePlot(plotId: string, plot: PlotUpdateInput): Promise<Plot> {
      const { data } = await client.PATCH("/v1/plots/byId/{plotId}", {
        params: {
          path: {
            plotId,
          },
        },
        body: plot,
      });
      return data!.data;
    },
    async deletePlot(plotId: string) {
      const { data } = await client.DELETE("/v1/plots/byId/{plotId}", {
        params: {
          path: {
            plotId,
          },
        },
      });
      return data!.data;
    },
    async syncMissingLocalIds() {
      await client.POST("/v1/plots/syncMissingLocalIds");
    },
  };
}
