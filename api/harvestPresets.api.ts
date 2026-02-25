import { FetchClient } from "./api";
import { components } from "./v1";

export type HarvestPreset =
  components["schemas"]["GetV1HarvestsPresetsPositiveResponse"]["data"]["result"][number];

export type HarvestPresetCreateInput =
  components["schemas"]["PostV1HarvestsPresetsRequestBody"];

export type HarvestPresetUpdateInput =
  components["schemas"]["PatchV1HarvestsPresetsByIdPresetIdRequestBody"];

export type HarvestPresetConservationMethod =
  HarvestPreset["conservationMethod"];

export function harvestPresetsApi(client: FetchClient) {
  return {
    async getHarvestPresets(): Promise<HarvestPreset[]> {
      const { data } = await client.GET("/v1/harvests/presets", {});
      return data!.data.result;
    },

    async getHarvestPresetById(presetId: string): Promise<HarvestPreset> {
      const { data } = await client.GET(
        "/v1/harvests/presets/byId/{presetId}",
        {
          params: { path: { presetId } },
        },
      );
      return data!.data;
    },

    async createHarvestPreset(
      preset: HarvestPresetCreateInput,
    ): Promise<HarvestPreset> {
      const { data } = await client.POST("/v1/harvests/presets", {
        body: preset,
      });
      return data!.data;
    },

    async updateHarvestPreset(
      presetId: string,
      preset: HarvestPresetUpdateInput,
    ): Promise<HarvestPreset> {
      const { data } = await client.PATCH(
        "/v1/harvests/presets/byId/{presetId}",
        {
          params: { path: { presetId } },
          body: preset,
        },
      );
      return data!.data;
    },

    async deleteHarvestPreset(presetId: string): Promise<void> {
      await client.DELETE("/v1/harvests/presets/byId/{presetId}", {
        params: { path: { presetId } },
      });
    },
  };
}
