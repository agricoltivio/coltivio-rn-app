import { FetchClient } from "./api";
import { components } from "./v1";

export type Plot =
  components["schemas"]["GetV1PlotsByIdPlotIdPositiveResponse"]["data"];

export type PlotCreateInput = components["schemas"]["PostV1PlotsRequestBody"];
export type PlotUpdateInput =
  components["schemas"]["PatchV1PlotsByIdPlotIdRequestBody"];

export type SplitPlotResult =
  components["schemas"]["PostV1PlotsByIdPlotIdSplitPositiveResponse"]["data"]["result"][number];

export type MergePlotResult =
  components["schemas"]["PostV1PlotsMergePositiveResponse"]["data"];

export type SplitPlotSubPlot = {
  geometry: { type: "MultiPolygon"; coordinates: number[][][][] };
  name: string;
  size: number;
};

export type SplitPlotInput =
  | {
      strategy: "keep_reference";
      originalPlotName?: string;
      subPlots: SplitPlotSubPlot[];
    }
  | {
      strategy: "delete_and_migrate";
      migrateToIndex: number;
      subPlots: SplitPlotSubPlot[];
    };

type MergePlotsBase = {
  plotIds: string[];
  name: string;
  localId?: string;
  usage?: number;
  cuttingDate?: string;
  geometry: { type: "MultiPolygon"; coordinates: number[][][][] };
  size: number;
  additionalNotes?: string;
};

export type MergePlotsInput =
  | (MergePlotsBase & { strategy: "keep_reference" })
  | (MergePlotsBase & { strategy: "delete_and_migrate" });

export function plotsApi(client: FetchClient) {
  return {
    async getPlots(): Promise<Plot[]> {
      console.log("query plots ...");
      const { data } = await client.GET("/v1/plots");
      console.log("query plots done");
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
    async splitPlot(
      plotId: string,
      body: SplitPlotInput,
    ): Promise<SplitPlotResult[]> {
      const { data } = await client.POST("/v1/plots/byId/{plotId}/split", {
        params: { path: { plotId } },
        // @ts-expect-error generated discriminated union type is broken (Record<string, never> intersection)
        body,
      });
      return data!.data.result;
    },
    async mergePlots(body: MergePlotsInput) {
      // @ts-expect-error generated discriminated union type is broken (Record<string, never> intersection)
      const { data } = await client.POST("/v1/plots/merge", { body });
      return data!.data;
    },
    async syncMissingLocalIds() {
      await client.POST("/v1/plots/syncMissingLocalIds");
    },
  };
}
