import { FetchClient } from "./api";
import { components } from "./v1";

export type TillageCreateInput =
  components["schemas"]["PostV1TillagesRequestBody"];

export type TillagesBatchCreateInput =
  components["schemas"]["PostV1TillagesBatchRequestBody"];

export type Tillage =
  components["schemas"]["GetV1TillagesByIdTillageIdPositiveResponse"]["data"];

export type TillageReason = Tillage["reason"];
export type TillageAction = Tillage["action"];

export type PlotTillage =
  components["schemas"]["GetV1TillagesByIdTillageIdPositiveResponse"]["data"];

export function tillagesApi(client: FetchClient) {
  return {
    async createTillage(input: TillageCreateInput): Promise<Tillage> {
      const { data } = await client.POST("/v1/tillages", {
        body: input,
      });
      return data!.data;
    },
    async createTillages(input: TillagesBatchCreateInput): Promise<Tillage[]> {
      const { data } = await client.POST("/v1/tillages/batch", {
        body: input,
      });
      return data!.data.result;
    },

    async getTillages(fromDate?: Date, toDate?: Date): Promise<Tillage[]> {
      const { data } = await client.GET("/v1/tillages", {
        params: {
          query: {
            fromDate: fromDate?.toISOString(),
            toDate: toDate?.toISOString(),
          },
        },
      });
      return data!.data.result;
    },

    async getTillageById(tillageId: string): Promise<Tillage> {
      const { data } = await client.GET("/v1/tillages/byId/{tillageId}", {
        params: {
          path: {
            tillageId,
          },
        },
      });
      return data!.data;
    },
    async getTillagesForPlot(plotId: string): Promise<PlotTillage[]> {
      const { data } = await client.GET("/v1/plots/byId/{plotId}/tillages", {
        params: {
          path: {
            plotId,
          },
        },
      });
      return data!.data.result;
    },
    async deleteTillage(tillageId: string) {
      await client.DELETE("/v1/tillages/byId/{tillageId}", {
        params: {
          path: {
            tillageId,
          },
        },
      });
    },
    async getTillageYears(): Promise<string[]> {
      const { data } = await client.GET("/v1/tillages/years");
      return data!.data.result;
    },
  };
}
