import { FetchClient } from "./api";
import { components } from "./v1";

export type FertilizerApplicationPreset =
  components["schemas"]["GetV1FertilizerApplicationsPresetsPositiveResponse"]["data"]["result"][number];

export type FertilizerApplicationPresetCreateInput =
  components["schemas"]["PostV1FertilizerApplicationsPresetsRequestBody"];

export type FertilizerApplicationPresetUpdateInput =
  components["schemas"]["PatchV1FertilizerApplicationsPresetsByIdPresetIdRequestBody"];

export function fertilizerApplicationPresetsApi(client: FetchClient) {
  return {
    async getFertilizerApplicationPresets(): Promise<
      FertilizerApplicationPreset[]
    > {
      const { data } = await client.GET(
        "/v1/fertilizerApplications/presets",
        {},
      );
      return data!.data.result;
    },

    async getFertilizerApplicationPresetById(
      presetId: string,
    ): Promise<FertilizerApplicationPreset> {
      const { data } = await client.GET(
        "/v1/fertilizerApplications/presets/byId/{presetId}",
        { params: { path: { presetId } } },
      );
      return data!.data;
    },

    async createFertilizerApplicationPreset(
      preset: FertilizerApplicationPresetCreateInput,
    ): Promise<FertilizerApplicationPreset> {
      const { data } = await client.POST("/v1/fertilizerApplications/presets", {
        body: preset,
      });
      return data!.data;
    },

    async updateFertilizerApplicationPreset(
      presetId: string,
      preset: FertilizerApplicationPresetUpdateInput,
    ): Promise<FertilizerApplicationPreset> {
      const { data } = await client.PATCH(
        "/v1/fertilizerApplications/presets/byId/{presetId}",
        { params: { path: { presetId } }, body: preset },
      );
      return data!.data;
    },

    async deleteFertilizerApplicationPreset(presetId: string): Promise<void> {
      await client.DELETE(
        "/v1/fertilizerApplications/presets/byId/{presetId}",
        {
          params: { path: { presetId } },
        },
      );
    },
  };
}
