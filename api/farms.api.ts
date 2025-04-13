import { FetchClient } from "./api";
import { components } from "./v1";

export type Farm = components["schemas"]["GetV1FarmPositiveResponse"]["data"];
export type FarmCreateInput = components["schemas"]["PostV1FarmRequestBody"];
export type FarmUpdateInput = components["schemas"]["PatchV1FarmRequestBody"];

export function farmApi(client: FetchClient) {
  return {
    async createFarm(farm: FarmCreateInput): Promise<Farm> {
      const { data } = await client.POST("/v1/farm", {
        body: farm,
      });
      return data!.data;
    },

    async getFarm(): Promise<Farm> {
      const { data } = await client.GET(`/v1/farm`);
      return data!.data;
    },

    async updateFarm(farm: FarmUpdateInput) {
      const { data } = await client.PATCH(`/v1/farm`, {
        body: farm,
      });
      return data!.data;
    },

    async deleteFarm(deleteAccount: boolean = false) {
      await client.DELETE("/v1/farm", {
        params: {
          query: {
            deleteAccount: deleteAccount ? "true" : "false",
          },
        },
      });
    },
  };
}
