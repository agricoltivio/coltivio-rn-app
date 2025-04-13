import { FetchClient } from "./api";
import { components } from "./v1";

export type CropProtectionApplicationCreateInput =
  components["schemas"]["PostV1CropProtectionApplicationsRequestBody"];

export type CropProtectionApplicationsBatchCreateInput =
  components["schemas"]["PostV1CropProtectionApplicationsBatchRequestBody"];

export type CropProtectionApplication =
  components["schemas"]["GetV1CropProtectionApplicationsByIdCropProtectionApplicationIdPositiveResponse"]["data"];

export type PlotCropProtectionApplication =
  components["schemas"]["GetV1CropProtectionApplicationsByIdCropProtectionApplicationIdPositiveResponse"]["data"];

export type CropProtectionApplicationMethod =
  CropProtectionApplication["method"];

export type CropProtectionApplicationSummary =
  components["schemas"]["GetV1CropProtectionApplicationsSummariesPositiveResponse"]["data"]["monthlyApplications"][0];

export function cropProtectionApplicationsApi(client: FetchClient) {
  return {
    async createCropProtectionApplication(
      input: CropProtectionApplicationCreateInput
    ): Promise<CropProtectionApplication> {
      const { data } = await client.POST("/v1/cropProtectionApplications", {
        body: input,
      });
      return data!.data;
    },
    async createCropProtectionApplications(
      input: CropProtectionApplicationsBatchCreateInput
    ): Promise<CropProtectionApplication[]> {
      const { data } = await client.POST(
        "/v1/cropProtectionApplications/batch",
        {
          body: input,
        }
      );
      return data!.data.result;
    },

    async getCropProtectionApplications(
      fromDate?: Date,
      toDate?: Date
    ): Promise<CropProtectionApplication[]> {
      const { data } = await client.GET("/v1/cropProtectionApplications", {
        params: {
          query: {
            fromDate: fromDate?.toISOString(),
            toDate: toDate?.toISOString(),
          },
        },
      });
      return data!.data.result;
    },

    async getCropProtectionApplicationById(
      cropProtectionApplicationId: string
    ): Promise<CropProtectionApplication> {
      const { data } = await client.GET(
        "/v1/cropProtectionApplications/byId/{cropProtectionApplicationId}",
        {
          params: {
            path: {
              cropProtectionApplicationId,
            },
          },
        }
      );
      return data!.data;
    },
    async getCropProtectionApplicationsForPlot(
      plotId: string
    ): Promise<PlotCropProtectionApplication[]> {
      const { data } = await client.GET(
        "/v1/plots/byId/{plotId}/cropProtectionApplications",
        {
          params: {
            path: {
              plotId,
            },
          },
        }
      );
      return data!.data.result;
    },
    async deleteCropProtectionApplication(cropProtectionApplicationId: string) {
      await client.DELETE(
        "/v1/cropProtectionApplications/byId/{cropProtectionApplicationId}",
        {
          params: {
            path: {
              cropProtectionApplicationId,
            },
          },
        }
      );
    },
    async getCropProtectionApplicationYears(): Promise<string[]> {
      const { data } = await client.GET("/v1/cropProtectionApplications/years");
      return data!.data.result;
    },
    async getCropProtectionApplicationSummariesForFarm(): Promise<
      CropProtectionApplicationSummary[]
    > {
      const { data } = await client.GET(
        "/v1/cropProtectionApplications/summaries"
      );
      return data!.data.monthlyApplications;
    },

    async getCropProtectionApplicationSummariesForPlot(
      plotId: string
    ): Promise<CropProtectionApplicationSummary[]> {
      const { data } = await client.GET(
        "/v1/plots/byId/{plotId}/cropProtectionApplicationSummary",
        {
          params: {
            path: {
              plotId,
            },
          },
        }
      );
      return data!.data.monthlyApplications;
    },
  };
}
