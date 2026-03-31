import { FetchClient } from "./api";
import { components } from "./v1";

export type FamilyTreeData =
  components["schemas"]["GetV1AnimalsFamilyTreePositiveResponse"]["data"];
export type FamilyTreeNode = FamilyTreeData["nodes"][number];
export type FamilyTreeEdge = FamilyTreeData["edges"][number];

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

export type AnimalImportPreviewResponse =
  components["schemas"]["PostV1AnimalsImportPreviewPositiveResponse"]["data"];

export type ParsedImportRow = AnimalImportPreviewResponse["rows"][number];

export type AnimalImportCommitInput =
  components["schemas"]["PostV1AnimalsImportCommitRequestBody"];

export type AnimalImportCommitResponse =
  components["schemas"]["PostV1AnimalsImportCommitPositiveResponse"]["data"];

export type CustomOutdoorJournalCategoryInput =
  components["schemas"]["PutV1AnimalsByIdAnimalIdCustomOutdoorJournalCategoriesRequestBody"];

export type CustomOutdoorJournalCategoryResponse =
  components["schemas"]["PutV1AnimalsByIdAnimalIdCustomOutdoorJournalCategoriesPositiveResponse"]["data"];

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

    async deleteAnimals(animalIds: string[]) {
      await client.DELETE("/v1/animals", {
        params: {
          query: {
            animalIds,
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

    async importAnimals(
      body: AnimalImportInput,
    ): Promise<AnimalImportResponse> {
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

    async previewImport(
      file: { uri: string; name: string; mimeType?: string },
      skipHeaderRow = true,
    ): Promise<AnimalImportPreviewResponse> {
      const filePayload = {
        uri: file.uri,
        name: file.name,
        type:
          file.mimeType ??
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      } as unknown as string;
      const { data } = await client.POST("/v1/animals/import/preview", {
        body: {
          file: filePayload,
          skipHeaderRow: skipHeaderRow ? "true" : "false",
        },
        bodySerializer: (body) => {
          const formData = new FormData();
          formData.append("file", body.file as unknown as Blob);
          if (body.skipHeaderRow) {
            formData.append("skipHeaderRow", body.skipHeaderRow);
          }
          return formData;
        },
      });
      return data!.data;
    },

    async commitImport(
      body: AnimalImportCommitInput,
    ): Promise<AnimalImportCommitResponse> {
      const { data } = await client.POST("/v1/animals/import/commit", {
        body,
      });
      return data!.data;
    },

    async setCustomOutdoorJournalCategories(
      animalId: string,
      input: CustomOutdoorJournalCategoryInput,
    ): Promise<CustomOutdoorJournalCategoryResponse> {
      const { data } = await client.PUT(
        "/v1/animals/byId/{animalId}/customOutdoorJournalCategories",
        {
          params: { path: { animalId } },
          body: input,
        },
      );
      return data!.data;
    },

    async getFamilyTree(type: AnimalType): Promise<FamilyTreeData> {
      const { data } = await client.GET("/v1/animals/familyTree", {
        params: { query: { type } },
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
