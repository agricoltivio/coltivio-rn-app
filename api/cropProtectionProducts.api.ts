import { FetchClient } from "./api";
import { components } from "./v1";

export type CropProtectionProduct =
  components["schemas"]["GetV1CropProtectionProductsPositiveResponse"]["data"]["result"][0];

export type CropProtectionProductUpdateInput =
  components["schemas"]["PatchV1CropProtectionProductsByIdCropProtectionProductIdRequestBody"];

export type CropProtectionProductCreateInput =
  components["schemas"]["PostV1CropProtectionProductsRequestBody"];

export type CropProtectionUnit = CropProtectionProduct["unit"];

export function cropProtectionProductsApi(client: FetchClient) {
  return {
    async getCropProtectionProducts(): Promise<CropProtectionProduct[]> {
      const { data } = await client.GET("/v1/cropProtectionProducts");
      return data!.data.result;
    },
    async getCropProtectionProductById(
      cropProtectionProductId: string
    ): Promise<CropProtectionProduct> {
      const { data } = await client.GET(
        "/v1/cropProtectionProducts/byId/{cropProtectionProductId}",
        {
          params: {
            path: {
              cropProtectionProductId,
            },
          },
        }
      );
      return data!.data;
    },

    async createCropProtectionProduct(
      cropProtectionProduct: CropProtectionProductCreateInput
    ): Promise<CropProtectionProduct> {
      const { data } = await client.POST("/v1/cropProtectionProducts", {
        body: cropProtectionProduct,
      });
      return data!.data;
    },

    async updateCropProtectionProduct(
      cropProtectionProductId: string,
      cropProtectionProduct: CropProtectionProductUpdateInput
    ): Promise<CropProtectionProduct> {
      const { data: newData } = await client.PATCH(
        "/v1/cropProtectionProducts/byId/{cropProtectionProductId}",
        {
          params: {
            path: {
              cropProtectionProductId,
            },
          },
          body: cropProtectionProduct,
        }
      );
      return newData!.data;
    },

    async deleteCropProtectionProduct(cropProtectionProductId: string) {
      await client.DELETE(
        "/v1/cropProtectionProducts/byId/{cropProtectionProductId}",
        {
          params: {
            path: {
              cropProtectionProductId,
            },
          },
        }
      );
    },
    async isCropProtectionProductInUse(
      cropProtectionProductId: string
    ): Promise<boolean> {
      const { data } = await client.GET(
        "/v1/cropProtectionProducts/byId/{cropProtectionProductId}/inUse",
        {
          params: {
            path: {
              cropProtectionProductId,
            },
          },
        }
      );
      return data!.data.inUse;
    },
  };
}
