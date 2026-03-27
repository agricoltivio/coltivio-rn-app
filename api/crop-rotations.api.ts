import { FetchClient } from "./api";
import { components } from "./v1";

export type DraftPlanSummary =
  components["schemas"]["GetV1CropRotationsDraftPlansPositiveResponse"]["data"]["result"][number];

export type DraftPlan =
  components["schemas"]["GetV1CropRotationsDraftPlansByIdDraftPlanIdPositiveResponse"]["data"];

export type DraftPlanPlot = DraftPlan["plots"][number];
export type DraftPlanRotation = DraftPlanPlot["rotations"][number];

export type DraftPlanCreateInput =
  components["schemas"]["PostV1CropRotationsDraftPlansRequestBody"];

export type DraftPlanUpdateInput =
  components["schemas"]["PatchV1CropRotationsDraftPlansByIdDraftPlanIdRequestBody"];

export type DraftPlanPlotInput = NonNullable<
  DraftPlanCreateInput["plots"]
>[number];

export type CropRotation =
  components["schemas"]["GetV1PlotsByIdPlotIdCropRotationsPositiveResponse"]["data"]["result"][number];
export type CropRotationCreateInput =
  components["schemas"]["PostV1CropRotationsRequestBody"];
export type CropRotationUpdateInput =
  components["schemas"]["PatchV1CropRotationsByIdRotationIdRequestBody"];

export type CropRotationCreateResult =
  components["schemas"]["PostV1CropRotationsPositiveResponse"]["data"];

export type CropRotationUpdateResult =
  components["schemas"]["PatchV1CropRotationsByIdRotationIdPositiveResponse"]["data"];

export type CropRotationCreateManyByCropInput =
  components["schemas"]["PostV1CropRotationsBatchByCropRequestBody"];

export type CropRotationBatchByCropResult =
  components["schemas"]["PostV1CropRotationsBatchByCropPositiveResponse"]["data"]["result"][number];

export type CropRotationCreateManyByPlotInput =
  components["schemas"]["PostV1CropRotationsBatchByPlotRequestBody"];

export type CropRotationBatchByPlotResult =
  components["schemas"]["PostV1CropRotationsBatchByPlotPositiveResponse"]["data"]["result"][number];

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

    async getCropRotations(
      fromDate?: Date,
      toDate?: Date,
      options: { expand?: boolean; withRecurrences?: boolean } = {},
    ) {
      const { data } = await client.GET("/v1/cropRotations", {
        params: {
          query: {
            fromDate: fromDate?.toISOString(),
            toDate: toDate?.toISOString(),
            expand:
              options.expand !== undefined ? String(options.expand) : undefined,
            withRecurrences:
              options.withRecurrences !== undefined
                ? String(options.withRecurrences)
                : undefined,
          },
        },
      });
      return data!.data.result;
    },

    async createCropRotation(
      cropRotation: CropRotationCreateInput,
    ): Promise<CropRotationCreateResult> {
      const { data } = await client.POST("/v1/cropRotations", {
        body: cropRotation,
      });
      return data!.data;
    },

    async createCropRotationsByCrop(
      input: CropRotationCreateManyByCropInput,
    ): Promise<CropRotationBatchByCropResult[]> {
      const { data } = await client.POST("/v1/cropRotations/batch/byCrop", {
        body: input,
      });
      return data!.data.result;
    },

    async createCropRotationsByPlot(
      input: CropRotationCreateManyByPlotInput,
    ): Promise<CropRotationBatchByPlotResult[]> {
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
    ): Promise<CropRotationUpdateResult> {
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

    async getDraftPlans(): Promise<DraftPlanSummary[]> {
      const { data } = await client.GET("/v1/cropRotations/draftPlans");
      return data!.data.result;
    },

    async createDraftPlan(input: DraftPlanCreateInput): Promise<DraftPlan> {
      const { data } = await client.POST("/v1/cropRotations/draftPlans", {
        body: input,
      });
      return data!.data;
    },

    async getDraftPlan(draftPlanId: string): Promise<DraftPlan> {
      const { data } = await client.GET(
        "/v1/cropRotations/draftPlans/byId/{draftPlanId}",
        { params: { path: { draftPlanId } } },
      );
      return data!.data;
    },

    async updateDraftPlan(
      draftPlanId: string,
      input: DraftPlanUpdateInput,
    ): Promise<DraftPlan> {
      const { data } = await client.PATCH(
        "/v1/cropRotations/draftPlans/byId/{draftPlanId}",
        { body: input, params: { path: { draftPlanId } } },
      );
      return data!.data;
    },

    async deleteDraftPlan(draftPlanId: string): Promise<void> {
      await client.DELETE("/v1/cropRotations/draftPlans/byId/{draftPlanId}", {
        params: { path: { draftPlanId } },
      });
    },

    async applyDraftPlan(draftPlanId: string): Promise<void> {
      await client.POST(
        "/v1/cropRotations/draftPlans/byId/{draftPlanId}/apply",
        { body: {}, params: { path: { draftPlanId } } },
      );
    },
  };
}
