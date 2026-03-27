import { FetchClient } from "./api";
import { components } from "./v1";

export type AnimalJournalEntry =
  components["schemas"]["GetV1AnimalsByIdAnimalIdJournalPositiveResponse"]["data"]["entries"][number];

export type AnimalJournalEntryDetail =
  components["schemas"]["GetV1AnimalsJournalByIdEntryIdPositiveResponse"]["data"];

export type AnimalJournalImage = AnimalJournalEntryDetail["images"][number];

export function animalJournalApi(client: FetchClient) {
  return {
    async getJournalEntries(animalId: string): Promise<AnimalJournalEntry[]> {
      const { data } = await client.GET("/v1/animals/byId/{animalId}/journal", {
        params: { path: { animalId } },
      });
      return data!.data.entries;
    },

    async createJournalEntry(
      animalId: string,
      body: components["schemas"]["PostV1AnimalsByIdAnimalIdJournalRequestBody"],
    ): Promise<components["schemas"]["PostV1AnimalsByIdAnimalIdJournalPositiveResponse"]["data"]> {
      const { data } = await client.POST(
        "/v1/animals/byId/{animalId}/journal",
        {
          params: { path: { animalId } },
          body,
        },
      );
      return data!.data;
    },

    async getJournalEntryById(entryId: string): Promise<AnimalJournalEntryDetail> {
      const { data } = await client.GET("/v1/animals/journal/byId/{entryId}", {
        params: { path: { entryId } },
      });
      return data!.data;
    },

    async updateJournalEntry(
      entryId: string,
      body: components["schemas"]["PatchV1AnimalsJournalByIdEntryIdRequestBody"],
    ): Promise<components["schemas"]["PatchV1AnimalsJournalByIdEntryIdPositiveResponse"]["data"]> {
      const { data } = await client.PATCH(
        "/v1/animals/journal/byId/{entryId}",
        {
          params: { path: { entryId } },
          body,
        },
      );
      return data!.data;
    },

    async deleteJournalEntry(entryId: string): Promise<void> {
      await client.DELETE("/v1/animals/journal/byId/{entryId}", {
        params: { path: { entryId } },
      });
    },

    async getImageSignedUrl(
      journalEntryId: string,
      filename: string,
    ): Promise<{ signedUrl: string; path: string }> {
      const { data } = await client.POST(
        "/v1/animals/journal/images/signedUrl",
        {
          body: { journalEntryId, filename },
        },
      );
      return data!.data;
    },

    async registerImage(
      journalEntryId: string,
      storagePath: string,
    ): Promise<AnimalJournalImage> {
      const { data } = await client.POST("/v1/animals/journal/images", {
        body: { journalEntryId, storagePath },
      });
      return data!.data;
    },

    async deleteImage(imageId: string): Promise<void> {
      await client.DELETE("/v1/animals/journal/images/byId/{imageId}", {
        params: { path: { imageId } },
      });
    },
  };
}
