import { FetchClient } from "./api";
import { components } from "./v1";

export type CropRotation =
  components["schemas"]["GetV1PlotsByIdPlotIdCropRotationsPositiveResponse"]["data"]["result"][number];
export type CropRotationCreateInput =
  components["schemas"]["PostV1CropRotationsRequestBody"];
export type CropRotationUpdateInput =
  components["schemas"]["PatchV1CropRotationsByIdRotationIdRequestBody"];

export type CropRotationCreateManyInput =
  components["schemas"]["PostV1CropRotationsBatchRequestBody"];

export function cropRotationsApi(client: FetchClient) {
  return {
    async getCropRotationById(rotationId: string): Promise<CropRotation> {
      const { data } = await client.GET("/v1/cropRotations/byId/{rotationId}", {
        params: {
          path: {
            rotationId,
          },
        },
      });
      return data!.data;
    },

    async getCropRotations(
      fromDate?: Date,
      toDate?: Date,
      skipNaturalMeadows?: boolean
    ) {
      const { data } = await client.GET("/v1/cropRotations", {
        params: {
          query: {
            fromDate: fromDate?.toISOString(),
            toDate: toDate?.toISOString(),
            skipNaturalMeadows,
          },
        },
      });
      return data!.data.result;
    },

    async createCropRotation(
      cropRotation: CropRotationCreateInput
    ): Promise<CropRotation> {
      const { data } = await client.POST("/v1/cropRotations", {
        body: cropRotation,
      });
      return data!.data;
    },

    async createCropRotations(
      input: CropRotationCreateManyInput
    ): Promise<CropRotation[]> {
      const { data } = await client.POST("/v1/cropRotations/batch", {
        body: input,
      });
      return data!.data.result;
    },

    async updateCropRotation(
      rotationId: string,
      cropRotation: CropRotationUpdateInput
    ) {
      const { data } = await client.PATCH(
        "/v1/cropRotations/byId/{rotationId}",
        {
          body: cropRotation,
          params: {
            path: {
              rotationId,
            },
          },
        }
      );
      return data!.data;
    },
    async deleteCropRotation(rotationId: string) {
      await client.DELETE("/v1/cropRotations/byId/{rotationId}", {
        params: {
          path: {
            rotationId,
          },
        },
      });
    },
    async getCropRotationYears(): Promise<string[]> {
      const { data } = await client.GET("/v1/cropRotations/years");
      return data!.data.result;
    },
  };
}
