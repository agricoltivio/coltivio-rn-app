import { FetchClient } from "./api";
import { components } from "./v1";

export type CropFamily =
  components["schemas"]["GetV1CropsFamiliesByIdFamilyIdPositiveResponse"]["data"];

export type CropFamilyCreateInput =
  components["schemas"]["PostV1CropsFamiliesRequestBody"];

export type CropFamilyUpdateInput =
  components["schemas"]["PatchV1CropsFamiliesByIdFamilyIdRequestBody"];

export function cropFamiliesApi(client: FetchClient) {
  return {
    async getCropFamilies(): Promise<CropFamily[]> {
      const { data } = await client.GET("/v1/crops/families");
      return data!.data.result;
    },

    async getCropFamilyById(familyId: string): Promise<CropFamily> {
      const { data } = await client.GET("/v1/crops/families/byId/{familyId}", {
        params: {
          path: {
            familyId,
          },
        },
      });
      return data!.data;
    },

    async createCropFamily(
      cropFamily: CropFamilyCreateInput
    ): Promise<CropFamily> {
      const { data } = await client.POST("/v1/crops/families", {
        body: cropFamily,
      });
      return data!.data;
    },

    async updateCropFamily(familyId: string, cropFamily: CropFamilyUpdateInput) {
      const { data } = await client.PATCH("/v1/crops/families/byId/{familyId}", {
        params: {
          path: {
            familyId,
          },
        },
        body: cropFamily,
      });
      return data!.data;
    },

    async deleteCropFamily(familyId: string) {
      await client.DELETE("/v1/crops/families/byId/{familyId}", {
        params: {
          path: {
            familyId,
          },
        },
      });
    },

    async isCropFamilyInUse(familyId: string) {
      const { data } = await client.GET(
        "/v1/crops/families/byId/{familyId}/inUse",
        {
          params: {
            path: {
              familyId,
            },
          },
        }
      );
      return data!.data.inUse;
    },
  };
}
