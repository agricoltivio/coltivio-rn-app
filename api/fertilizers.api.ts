import { FetchClient } from "./api";
import { components } from "./v1";

export type Fertilizer =
  components["schemas"]["GetV1FertilizersPositiveResponse"]["data"]["result"][0];

export type FertilizerUpdateInput =
  components["schemas"]["PatchV1FertilizersByIdFertilizerIdRequestBody"];

export type FertilizerCreateInput =
  components["schemas"]["PostV1FertilizersRequestBody"];

export type FertilizerUnit = FertilizerCreateInput["unit"];

export function fertilizersApi(client: FetchClient) {
  return {
    async getFertilizers(): Promise<Fertilizer[]> {
      const { data } = await client.GET("/v1/fertilizers");
      return data!.data.result;
    },
    async getFertilizerById(fertilizerId: string): Promise<Fertilizer> {
      const { data } = await client.GET("/v1/fertilizers/byId/{fertilizerId}", {
        params: {
          path: {
            fertilizerId,
          },
        },
      });
      return data!.data;
    },

    async createFertilizer(
      fertilizer: FertilizerCreateInput
    ): Promise<Fertilizer> {
      const { data } = await client.POST("/v1/fertilizers", {
        body: fertilizer,
      });
      return data!.data;
    },

    async updateFertilizer(
      fertilizerId: string,
      fertilizer: FertilizerUpdateInput
    ): Promise<Fertilizer> {
      const { data: newData } = await client.PATCH(
        "/v1/fertilizers/byId/{fertilizerId}",
        {
          params: {
            path: {
              fertilizerId,
            },
          },
          body: fertilizer,
        }
      );
      return newData!.data;
    },

    async deleteFertilizer(fertilizerId: string) {
      await client.DELETE("/v1/fertilizers/byId/{fertilizerId}", {
        params: {
          path: {
            fertilizerId,
          },
        },
      });
    },
    async isFertilizerInUse(fertilizerId: string): Promise<boolean> {
      const { data } = await client.GET(
        "/v1/fertilizers/byId/{fertilizerId}/inUse",
        {
          params: {
            path: {
              fertilizerId,
            },
          },
        }
      );
      return data!.data.inUse;
    },
  };
}
