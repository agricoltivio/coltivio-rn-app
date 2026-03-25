import { FetchClient } from "./api";
import { components } from "./v1";

export type Drug =
  components["schemas"]["GetV1DrugsPositiveResponse"]["data"]["result"][number];

export type DrugDetail =
  components["schemas"]["GetV1DrugsByIdDrugIdPositiveResponse"]["data"];

export type DrugCreateInput = components["schemas"]["PostV1DrugsRequestBody"];

export type DrugUpdateInput =
  components["schemas"]["PatchV1DrugsByIdDrugIdRequestBody"];

export type DrugCreateResponse =
  components["schemas"]["PostV1DrugsPositiveResponse"]["data"];

export type DrugUpdateResponse =
  components["schemas"]["PatchV1DrugsByIdDrugIdPositiveResponse"]["data"];

export type DrugInUseResponse =
  components["schemas"]["GetV1DrugsByIdDrugIdInUsePositiveResponse"]["data"];

export function drugsApi(client: FetchClient) {
  return {
    async getDrugs(): Promise<Drug[]> {
      const { data } = await client.GET("/v1/drugs");
      return data!.data.result;
    },

    async getDrugById(drugId: string): Promise<DrugDetail> {
      const { data } = await client.GET("/v1/drugs/byId/{drugId}", {
        params: { path: { drugId } },
      });
      return data!.data;
    },

    async createDrug(input: DrugCreateInput): Promise<DrugCreateResponse> {
      const { data } = await client.POST("/v1/drugs", { body: input });
      return data!.data;
    },

    async updateDrug(
      drugId: string,
      input: DrugUpdateInput,
    ): Promise<DrugUpdateResponse> {
      const { data } = await client.PATCH("/v1/drugs/byId/{drugId}", {
        params: { path: { drugId } },
        body: input,
      });
      return data!.data;
    },

    async deleteDrug(drugId: string): Promise<void> {
      await client.DELETE("/v1/drugs/byId/{drugId}", {
        params: { path: { drugId } },
      });
    },

    async checkDrugInUse(drugId: string): Promise<DrugInUseResponse> {
      const { data } = await client.GET("/v1/drugs/byId/{drugId}/inUse", {
        params: { path: { drugId } },
      });
      return data!.data;
    },
  };
}
