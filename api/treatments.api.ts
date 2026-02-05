import { FetchClient } from "./api";
import { components } from "./v1";

export type Treatment = components["schemas"]["GetV1TreatmentsPositiveResponse"]["data"]["result"][number];

export type AnimalTreatment = components["schemas"]["GetV1AnimalsByIdAnimalIdTreatmentsPositiveResponse"]["data"]["result"][number];

export type TreatmentDetail = components["schemas"]["GetV1TreatmentsByIdTreatmentIdPositiveResponse"]["data"];

export type TreatmentCreateInput = components["schemas"]["PostV1TreatmentsRequestBody"];

export type TreatmentUpdateInput = components["schemas"]["PatchV1TreatmentsByIdTreatmentIdRequestBody"];

export type TreatmentCreateResponse = components["schemas"]["PostV1TreatmentsPositiveResponse"]["data"];

export type TreatmentUpdateResponse = components["schemas"]["PatchV1TreatmentsByIdTreatmentIdPositiveResponse"]["data"];

export function treatmentsApi(client: FetchClient) {
  return {
    async getTreatments(): Promise<Treatment[]> {
      const { data } = await client.GET("/v1/treatments");
      return data!.data.result;
    },

    async getAnimalTreatments(animalId: string): Promise<AnimalTreatment[]> {
      const { data } = await client.GET("/v1/animals/byId/{animalId}/treatments", {
        params: { path: { animalId } },
      });
      return data!.data.result;
    },

    async getTreatmentById(treatmentId: string): Promise<TreatmentDetail> {
      const { data } = await client.GET("/v1/treatments/byId/{treatmentId}", {
        params: { path: { treatmentId } },
      });
      return data!.data;
    },

    async createTreatment(input: TreatmentCreateInput): Promise<TreatmentCreateResponse> {
      const { data } = await client.POST("/v1/treatments", { body: input });
      return data!.data;
    },

    async updateTreatment(treatmentId: string, input: TreatmentUpdateInput): Promise<TreatmentUpdateResponse> {
      const { data } = await client.PATCH("/v1/treatments/byId/{treatmentId}", {
        params: { path: { treatmentId } },
        body: input,
      });
      return data!.data;
    },

    async deleteTreatment(treatmentId: string): Promise<void> {
      await client.DELETE("/v1/treatments/byId/{treatmentId}", {
        params: { path: { treatmentId } },
      });
    },
  };
}
