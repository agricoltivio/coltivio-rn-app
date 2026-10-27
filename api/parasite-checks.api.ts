import { FetchClient } from "./api";
import { components } from "./v1";

export type ParasiteCheck =
  components["schemas"]["GetV1ParasiteChecksPositiveResponse"]["data"]["result"][number];

export type ParasiteCheckMethod = ParasiteCheck["method"];

export type ParasiteType =
  ParasiteCheck["fecSamples"][number]["results"][number]["parasiteType"];

export type ParasiteCheckCreateInput =
  components["schemas"]["PostV1ParasiteChecksRequestBody"];

export type ParasiteCheckUpdateInput = Omit<
  components["schemas"]["PatchV1ParasiteChecksByIdCheckIdRequestBody"],
  "checkId"
>;

export type AnimalParasiteHistory =
  components["schemas"]["GetV1AnimalsByIdAnimalIdParasiteHistoryPositiveResponse"]["data"];

export type ParasiteCheckFilters = {
  herdId?: string;
  animalId?: string;
};

export function parasiteChecksApi(client: FetchClient) {
  return {
    async getParasiteChecks(
      filters: ParasiteCheckFilters = {},
    ): Promise<ParasiteCheck[]> {
      const { data } = await client.GET("/v1/parasiteChecks", {
        params: { query: filters },
      });
      return data!.data.result;
    },

    async getParasiteCheckById(checkId: string): Promise<ParasiteCheck> {
      const { data } = await client.GET("/v1/parasiteChecks/byId/{checkId}", {
        params: { path: { checkId } },
      });
      return data!.data;
    },

    async createParasiteCheck(
      input: ParasiteCheckCreateInput,
    ): Promise<ParasiteCheck> {
      const { data } = await client.POST("/v1/parasiteChecks", {
        body: input,
      });
      return data!.data;
    },

    async updateParasiteCheck(
      checkId: string,
      input: ParasiteCheckUpdateInput,
    ): Promise<ParasiteCheck> {
      const { data } = await client.PATCH("/v1/parasiteChecks/byId/{checkId}", {
        params: { path: { checkId } },
        body: input,
      });
      return data!.data;
    },

    async deleteParasiteCheck(checkId: string): Promise<void> {
      await client.DELETE("/v1/parasiteChecks/byId/{checkId}", {
        params: { path: { checkId } },
      });
    },

    async getAnimalParasiteHistory(
      animalId: string,
    ): Promise<AnimalParasiteHistory> {
      const { data } = await client.GET(
        "/v1/animals/byId/{animalId}/parasiteHistory",
        { params: { path: { animalId } } },
      );
      return data!.data;
    },

    async getHerdParasiteOverview(herdId: string): Promise<ParasiteCheck[]> {
      const { data } = await client.GET(
        "/v1/animals/herds/byId/{herdId}/parasiteOverview",
        { params: { path: { herdId } } },
      );
      return data!.data.result;
    },
  };
}
