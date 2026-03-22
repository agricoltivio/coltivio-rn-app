import { FetchClient } from "./api";
import { components } from "./v1";

export type CropProtectionApplicationPreset =
  components["schemas"]["GetV1CropProtectionApplicationsPresetsPositiveResponse"]["data"]["result"][number];

export type CropProtectionApplicationPresetCreateInput =
  components["schemas"]["PostV1CropProtectionApplicationsPresetsRequestBody"];

export type CropProtectionApplicationPresetUpdateInput =
  components["schemas"]["PatchV1CropProtectionApplicationsPresetsByIdPresetIdRequestBody"];

export type CropProtectionApplicationPresetMethod =
  CropProtectionApplicationPreset["method"];
export type CropProtectionApplicationPresetUnit =
  CropProtectionApplicationPreset["unit"];

export function cropProtectionApplicationPresetsApi(client: FetchClient) {
  return {
    async getCropProtectionApplicationPresets(): Promise<
      CropProtectionApplicationPreset[]
    > {
      const { data } = await client.GET(
        "/v1/cropProtectionApplications/presets",
        {},
      );
      return data!.data.result;
    },

    async getCropProtectionApplicationPresetById(
      presetId: string,
    ): Promise<CropProtectionApplicationPreset> {
      const { data } = await client.GET(
        "/v1/cropProtectionApplications/presets/byId/{presetId}",
        {
          params: { path: { presetId } },
        },
      );
      return data!.data;
    },

    async createCropProtectionApplicationPreset(
      preset: CropProtectionApplicationPresetCreateInput,
    ): Promise<CropProtectionApplicationPreset> {
      const { data } = await client.POST(
        "/v1/cropProtectionApplications/presets",
        {
          body: preset,
        },
      );
      return data!.data;
    },

    async updateCropProtectionApplicationPreset(
      presetId: string,
      preset: CropProtectionApplicationPresetUpdateInput,
    ): Promise<CropProtectionApplicationPreset> {
      const { data } = await client.PATCH(
        "/v1/cropProtectionApplications/presets/byId/{presetId}",
        {
          params: { path: { presetId } },
          body: preset,
        },
      );
      return data!.data;
    },

    async deleteCropProtectionApplicationPreset(
      presetId: string,
    ): Promise<void> {
      await client.DELETE(
        "/v1/cropProtectionApplications/presets/byId/{presetId}",
        {
          params: { path: { presetId } },
        },
      );
    },
  };
}
