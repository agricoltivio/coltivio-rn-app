import { FetchClient } from "./api";
import { components } from "./v1";

export type FarmJournalEntry =
  components["schemas"]["GetV1FarmJournalPositiveResponse"]["data"]["entries"][number];

export type FarmJournalEntryDetail =
  components["schemas"]["GetV1FarmJournalByIdEntryIdPositiveResponse"]["data"];

export type FarmJournalImage = FarmJournalEntryDetail["images"][number];

export function farmJournalApi(client: FetchClient) {
  return {
    async getJournalEntries(): Promise<FarmJournalEntry[]> {
      const { data } = await client.GET("/v1/farm/journal");
      return data!.data.entries;
    },

    async createJournalEntry(
      body: components["schemas"]["PostV1FarmJournalRequestBody"],
    ): Promise<
      components["schemas"]["PostV1FarmJournalPositiveResponse"]["data"]
    > {
      const { data } = await client.POST("/v1/farm/journal", { body });
      return data!.data;
    },

    async getJournalEntryById(
      entryId: string,
    ): Promise<FarmJournalEntryDetail> {
      const { data } = await client.GET("/v1/farm/journal/byId/{entryId}", {
        params: { path: { entryId } },
      });
      return data!.data;
    },

    async updateJournalEntry(
      entryId: string,
      body: components["schemas"]["PatchV1FarmJournalByIdEntryIdRequestBody"],
    ): Promise<
      components["schemas"]["PatchV1FarmJournalByIdEntryIdPositiveResponse"]["data"]
    > {
      const { data } = await client.PATCH("/v1/farm/journal/byId/{entryId}", {
        params: { path: { entryId } },
        body,
      });
      return data!.data;
    },

    async deleteJournalEntry(entryId: string): Promise<void> {
      await client.DELETE("/v1/farm/journal/byId/{entryId}", {
        params: { path: { entryId } },
      });
    },

    async getImageSignedUrl(
      journalEntryId: string,
      filename: string,
    ): Promise<{ signedUrl: string; path: string }> {
      const { data } = await client.POST("/v1/farm/journal/images/signedUrl", {
        body: { journalEntryId, filename },
      });
      return data!.data;
    },

    async registerImage(
      journalEntryId: string,
      storagePath: string,
    ): Promise<FarmJournalImage> {
      const { data } = await client.POST("/v1/farm/journal/images", {
        body: { journalEntryId, storagePath },
      });
      return data!.data;
    },

    async deleteImage(imageId: string): Promise<void> {
      await client.DELETE("/v1/farm/journal/images/byId/{imageId}", {
        params: { path: { imageId } },
      });
    },
  };
}
