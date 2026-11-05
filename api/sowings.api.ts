import { FetchClient } from "./api";
import { components } from "./v1";

export type Sowing =
  components["schemas"]["GetV1SowingsPositiveResponse"]["data"]["result"][number];

export type PlotSowing =
  components["schemas"]["GetV1PlotsByIdPlotIdSowingsPositiveResponse"]["data"]["result"][number];

export type SowingUnit = Sowing["unit"];

export type SowingUnitInfo =
  components["schemas"]["GetV1SowingsUnitsPositiveResponse"]["data"]["result"][number];

export type SowingBatchCreateInput =
  components["schemas"]["PostV1SowingsRequestBody"];

export type SowingUpdateInput =
  components["schemas"]["PatchV1SowingsByIdSowingIdRequestBody"];

export type SowingSummary =
  components["schemas"]["GetV1SowingsSummariesPositiveResponse"]["data"]["monthlySowings"][number];

export type SowingPreset =
  components["schemas"]["GetV1SowingsPresetsPositiveResponse"]["data"]["result"][number];

export type SowingPresetCreateInput =
  components["schemas"]["PostV1SowingsPresetsRequestBody"];

export type SowingPresetUpdateInput =
  components["schemas"]["PatchV1SowingsPresetsByIdPresetIdRequestBody"];

export function sowingsApi(client: FetchClient) {
  return {
    async createSowings(sowings: SowingBatchCreateInput): Promise<Sowing[]> {
      const { data } = await client.POST("/v1/sowings", { body: sowings });
      return data!.data.result;
    },
    async getSowings(): Promise<Sowing[]> {
      const { data } = await client.GET("/v1/sowings");
      return data!.data.result;
    },
    async getSowingById(sowingId: string): Promise<Sowing> {
      const { data } = await client.GET("/v1/sowings/byId/{sowingId}", {
        params: { path: { sowingId } },
      });
      return data!.data;
    },
    async getPlotSowings(plotId: string): Promise<PlotSowing[]> {
      const { data } = await client.GET("/v1/plots/byId/{plotId}/sowings", {
        params: { path: { plotId } },
      });
      return data!.data.result;
    },
    async getSowingSummaries(): Promise<SowingSummary[]> {
      const { data } = await client.GET("/v1/sowings/summaries");
      return data!.data.monthlySowings;
    },
    async getPlotSowingSummaries(plotId: string): Promise<SowingSummary[]> {
      const { data } = await client.GET(
        "/v1/plots/byId/{plotId}/sowingSummary",
        { params: { path: { plotId } } },
      );
      return data!.data.monthlySowings;
    },
    async updateSowing(sowingId: string, input: SowingUpdateInput) {
      const { data } = await client.PATCH("/v1/sowings/byId/{sowingId}", {
        params: { path: { sowingId } },
        body: input,
      });
      return data!.data;
    },
    async deleteSowing(sowingId: string) {
      await client.DELETE("/v1/sowings/byId/{sowingId}", {
        params: { path: { sowingId } },
      });
    },
    // unit -> quantity kind / per-area map, the single source of truth for unit filtering
    async getSowingUnits(): Promise<SowingUnitInfo[]> {
      const { data } = await client.GET("/v1/sowings/units");
      return data!.data.result;
    },
    async getSowingPresets(): Promise<SowingPreset[]> {
      const { data } = await client.GET("/v1/sowings/presets");
      return data!.data.result;
    },
    async createSowingPreset(
      preset: SowingPresetCreateInput,
    ): Promise<SowingPreset> {
      const { data } = await client.POST("/v1/sowings/presets", {
        body: preset,
      });
      return data!.data;
    },
    async updateSowingPreset(
      presetId: string,
      preset: SowingPresetUpdateInput,
    ): Promise<SowingPreset> {
      const { data } = await client.PATCH(
        "/v1/sowings/presets/byId/{presetId}",
        { params: { path: { presetId } }, body: preset },
      );
      return data!.data;
    },
    async deleteSowingPreset(presetId: string) {
      await client.DELETE("/v1/sowings/presets/byId/{presetId}", {
        params: { path: { presetId } },
      });
    },
  };
}
