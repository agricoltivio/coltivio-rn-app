import { FetchClient } from "./api";
import { components } from "./v1";

export type TillagePreset =
  components["schemas"]["GetV1TillagesPresetsPositiveResponse"]["data"]["result"][number];

export type TillagePresetCreateInput =
  components["schemas"]["PostV1TillagesPresetsRequestBody"];

export type TillagePresetUpdateInput =
  components["schemas"]["PatchV1TillagesPresetsByIdPresetIdRequestBody"];

export type TillagePresetReason = TillagePreset["reason"];
export type TillagePresetAction = TillagePreset["action"];

export function tillagePresetsApi(client: FetchClient) {
  return {
    async getTillagePresets(): Promise<TillagePreset[]> {
      const { data } = await client.GET("/v1/tillages/presets", {});
      return data!.data.result;
    },

    async getTillagePresetById(presetId: string): Promise<TillagePreset> {
      const { data } = await client.GET(
        "/v1/tillages/presets/byId/{presetId}",
        {
          params: { path: { presetId } },
        },
      );
      return data!.data;
    },

    async createTillagePreset(
      preset: TillagePresetCreateInput,
    ): Promise<TillagePreset> {
      const { data } = await client.POST("/v1/tillages/presets", {
        body: preset,
      });
      return data!.data;
    },

    async updateTillagePreset(
      presetId: string,
      preset: TillagePresetUpdateInput,
    ): Promise<TillagePreset> {
      const { data } = await client.PATCH(
        "/v1/tillages/presets/byId/{presetId}",
        {
          params: { path: { presetId } },
          body: preset,
        },
      );
      return data!.data;
    },

    async deleteTillagePreset(presetId: string): Promise<void> {
      await client.DELETE("/v1/tillages/presets/byId/{presetId}", {
        params: { path: { presetId } },
      });
    },
  };
}
