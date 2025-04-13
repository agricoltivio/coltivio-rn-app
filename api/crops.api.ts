import { FetchClient } from "./api";
import { components } from "./v1";

export type Crop =
  components["schemas"]["GetV1CropsByIdCropIdPositiveResponse"]["data"];

export type CropCreateInput = components["schemas"]["PostV1CropsRequestBody"];
export type CropCategory = CropCreateInput["category"];

export type CropUpdateInput =
  components["schemas"]["PatchV1CropsByIdCropIdRequestBody"];

export function cropsApi(client: FetchClient) {
  return {
    async getCrops(): Promise<Crop[]> {
      const { data } = await client.GET("/v1/crops");
      return data!.data.result;
    },

    async getCropById(cropId: string): Promise<Crop> {
      const { data } = await client.GET("/v1/crops/byId/{cropId}", {
        params: {
          path: {
            cropId,
          },
        },
      });
      return data!.data;
    },
    async createCrop(crop: CropCreateInput): Promise<Crop> {
      const { data } = await client.POST("/v1/crops", {
        body: crop,
      });
      return data!.data;
    },
    async updateCrop(cropId: string, crop: CropUpdateInput) {
      const { data } = await client.PATCH("/v1/crops/byId/{cropId}", {
        params: {
          path: {
            cropId,
          },
        },
        body: crop,
      });
      return data!.data;
    },
    async deleteCrop(cropId: string) {
      await client.DELETE("/v1/crops/byId/{cropId}", {
        params: {
          path: {
            cropId,
          },
        },
      });
    },
  };
}
