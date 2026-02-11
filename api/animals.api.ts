import { FetchClient } from "./api";
import { components } from "./v1";

export type AnimalWithWaitingTimeFlag =
  components["schemas"]["GetV1AnimalsPositiveResponse"]["data"]["result"][number];
export type AnimalType = AnimalWithWaitingTimeFlag["type"];

export type Animal =
  components["schemas"]["PostV1AnimalsPositiveResponse"]["data"];

export type AnimalDetail =
  components["schemas"]["GetV1AnimalsByIdAnimalIdPositiveResponse"]["data"];

export type AnimalCreateInput =
  components["schemas"]["PostV1AnimalsRequestBody"];

export type AnimalUpdateInput =
  components["schemas"]["PatchV1AnimalsByIdAnimalIdRequestBody"];

export type AnimalCreateResponse =
  components["schemas"]["PostV1AnimalsPositiveResponse"]["data"];

export type AnimalUpdateResponse =
  components["schemas"]["PatchV1AnimalsByIdAnimalIdPositiveResponse"]["data"];

export type AnimalBatchUpdateInput =
  components["schemas"]["PatchV1AnimalsBatchRequestBody"];

export type AnimalBatchUpdateResponse =
  components["schemas"]["PatchV1AnimalsBatchPositiveResponse"]["data"];

export type AnimalImportInput =
  components["schemas"]["PostV1AnimalsImportRequestBody"];

export type AnimalImportResponse =
  components["schemas"]["PostV1AnimalsImportPositiveResponse"]["data"];

export function animalsApi(client: FetchClient) {
  return {
    async getAnimals(
      onlyLiving: boolean,
      animalTypes?: AnimalType[],
    ): Promise<AnimalWithWaitingTimeFlag[]> {
      const { data } = await client.GET("/v1/animals", {
        params: {
          query: {
            onlyLiving: String(onlyLiving),
            animalTypes,
          },
        },
      });
      return data!.data.result;
    },

    async getAnimalById(animalId: string): Promise<AnimalDetail> {
      const { data } = await client.GET("/v1/animals/byId/{animalId}", {
        params: {
          path: {
            animalId,
          },
        },
      });
      return data!.data;
    },

    async createAnimal(
      animal: AnimalCreateInput,
    ): Promise<AnimalCreateResponse> {
      const { data } = await client.POST("/v1/animals", {
        body: animal,
      });
      return data!.data;
    },

    async updateAnimal(
      animalId: string,
      animal: AnimalUpdateInput,
    ): Promise<AnimalUpdateResponse> {
      const { data } = await client.PATCH("/v1/animals/byId/{animalId}", {
        params: {
          path: {
            animalId,
          },
        },
        body: animal,
      });
      return data!.data;
    },

    async deleteAnimal(animalId: string) {
      await client.DELETE("/v1/animals/byId/{animalId}", {
        params: {
          path: {
            animalId,
          },
        },
      });
    },

    async batchUpdateAnimals(
      input: AnimalBatchUpdateInput,
    ): Promise<AnimalBatchUpdateResponse> {
      const { data } = await client.PATCH("/v1/animals/batch", {
        body: input,
      });
      return data!.data;
    },

    async importAnimals(body: AnimalImportInput): Promise<AnimalImportResponse> {
      const { data } = await client.POST("/v1/animals/import", {
        body,
        bodySerializer: (body) => {
          const formData = new FormData();
          formData.append("file", body.file as unknown as Blob);
          formData.append("type", body.type);
          if (body.skipHeaderRow) {
            formData.append("skipHeaderRow", body.skipHeaderRow);
          }
          return formData;
        },
      });
      return data!.data;
    },

    async getAnimalChildren(animalId: string): Promise<Animal[]> {
      const { data } = await client.GET(
        "/v1/animals/byId/{animalId}/children",
        {
          params: {
            path: {
              animalId,
            },
          },
        },
      );
      return data!.data.result;
    },
  };
}
