import { FetchClient } from "./api";
import { components } from "./v1";

export type HarvestingMachinery =
  components["schemas"]["GetV1HarvestingMachineryPositiveResponse"]["data"]["result"][0];

export type HarvestingMachineryCreateInput =
  components["schemas"]["PostV1HarvestingMachineryRequestBody"];

export type HarvestingMachineryUpdateInput =
  components["schemas"]["PatchV1HarvestingMachineryByIdHarvestingMachineryIdRequestBody"];

export type ProcessingType = HarvestingMachinery["defaultProcessingType"];
export type ConservationMethod =
  HarvestingMachinery["defaultConservationMethod"];

export function harvestingMachineryApi(client: FetchClient) {
  return {
    async getHarvestingMachinery(): Promise<HarvestingMachinery[]> {
      const { data } = await client.GET("/v1/harvestingMachinery", {});
      return data!.data.result;
    },
    async getHarvestingMachineryById(
      harvestingMachineryId: string
    ): Promise<HarvestingMachinery> {
      const { data } = await client.GET(
        "/v1/harvestingMachinery/byId/{harvestingMachineryId}",
        {
          params: { path: { harvestingMachineryId } },
        }
      );
      return data!.data!;
    },
    async updateHarvestingMachinery(
      harvestingMachineryId: string,
      harvestingMachinery: HarvestingMachineryUpdateInput
    ): Promise<HarvestingMachinery> {
      const { data: newData } = await client.PATCH(
        "/v1/harvestingMachinery/byId/{harvestingMachineryId}",
        {
          params: { path: { harvestingMachineryId } },
          body: harvestingMachinery,
        }
      );
      return newData!.data;
    },

    async createHarvestingMachinery(
      harvestingMachinery: HarvestingMachineryCreateInput
    ): Promise<HarvestingMachinery> {
      const { data } = await client.POST("/v1/harvestingMachinery", {
        body: harvestingMachinery,
      });
      return data!.data;
    },

    async deleteHarvestingMachinery(harvestingMachineryId: string) {
      await client.DELETE(
        "/v1/harvestingMachinery/byId/{harvestingMachineryId}",
        {
          params: { path: { harvestingMachineryId } },
        }
      );
    },
  };
}
