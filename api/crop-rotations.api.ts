import { FetchClient } from "./api";
import { components } from "./v1";

export type CropRotation =
  components["schemas"]["GetV1PlotsByIdPlotIdCropRotationsPositiveResponse"]["data"]["result"][number];
export type CropRotationCreateInput =
  components["schemas"]["PostV1CropRotationsRequestBody"];
export type CropRotationUpdateInput =
  components["schemas"]["PatchV1CropRotationsByIdRotationIdRequestBody"];

export type CropRotationCreateManyByCropInput =
  components["schemas"]["PostV1CropRotationsBatchByCropRequestBody"];

export type CropRotationCreateManyByPlotInput =
  components["schemas"]["PostV1CropRotationsBatchByPlotRequestBody"];

export type PlotCropRotation =
  components["schemas"]["GetV1CropRotationsPlotsPositiveResponse"]["data"]["result"][number];

export type CropRotationPlanInput =
  components["schemas"]["PatchV1CropRotationsPlanRequestBody"];

export type CropRotationPlanResult =
  components["schemas"]["PatchV1CropRotationsPlanPositiveResponse"]["data"]["result"];

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

    async getCropRotations(fromDate?: Date, toDate?: Date) {
      const { data } = await client.GET("/v1/cropRotations", {
        params: {
          query: {
            fromDate: fromDate?.toISOString(),
            toDate: toDate?.toISOString(),
          },
        },
      });
      return data!.data.result;
    },

    async createCropRotation(
      cropRotation: CropRotationCreateInput,
    ): Promise<CropRotation> {
      const { data } = await client.POST("/v1/cropRotations", {
        body: cropRotation,
      });
      return data!.data;
    },

    async createCropRotationsByCrop(
      input: CropRotationCreateManyByCropInput,
    ): Promise<CropRotation[]> {
      const { data } = await client.POST("/v1/cropRotations/batch/byCrop", {
        body: input,
      });
      return data!.data.result;
    },

    async createCropRotationsByPlot(
      input: CropRotationCreateManyByPlotInput,
    ): Promise<CropRotation[]> {
      const { data } = await client.POST("/v1/cropRotations/batch/byPlot", {
        body: input,
      });
      return data!.data.result;
    },

    async getCropRotationsByPlotIds(
      plotIds: string[],
      fromDate: Date,
      toDate: Date,
      options: {
        onlyCurrent?: boolean;
        expand?: boolean;
        includeRecurrence?: boolean;
      } = {},
    ): Promise<PlotCropRotation[]> {
      const {
        onlyCurrent = true,
        expand = true,
        includeRecurrence = false,
      } = options;
      const { data } = await client.GET("/v1/cropRotations/plots", {
        params: {
          query: {
            plotIds,
            fromDate: fromDate.toISOString(),
            toDate: toDate.toISOString(),
            onlyCurrent: String(onlyCurrent),
            expand: String(expand),
            withRecurrences: String(includeRecurrence),
          },
        },
      });
      return data!.data.result;
    },

    async updateCropRotation(
      rotationId: string,
      cropRotation: CropRotationUpdateInput,
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
        },
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
    async planCropRotations(
      input: CropRotationPlanInput,
    ): Promise<CropRotationPlanResult> {
      const { data } = await client.PATCH("/v1/cropRotations/plan", {
        body: input,
      });
      return data!.data.result;
    },
  };
}
