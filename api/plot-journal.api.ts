import { FetchClient } from "./api";
import { components } from "./v1";

export type PlotJournalEntry =
  components["schemas"]["GetV1PlotsByIdPlotIdJournalPositiveResponse"]["data"]["entries"][number];

export type PlotJournalEntryDetail =
  components["schemas"]["GetV1PlotsJournalByIdEntryIdPositiveResponse"]["data"];

export type PlotJournalImage = PlotJournalEntryDetail["images"][number];

export function plotJournalApi(client: FetchClient) {
  return {
    async getJournalEntries(plotId: string): Promise<PlotJournalEntry[]> {
      const { data } = await client.GET("/v1/plots/byId/{plotId}/journal", {
        params: { path: { plotId } },
      });
      return data!.data.entries;
    },

    async createJournalEntry(
      plotId: string,
      body: components["schemas"]["PostV1PlotsByIdPlotIdJournalRequestBody"],
    ): Promise<components["schemas"]["PostV1PlotsByIdPlotIdJournalPositiveResponse"]["data"]> {
      const { data } = await client.POST("/v1/plots/byId/{plotId}/journal", {
        params: { path: { plotId } },
        body,
      });
      return data!.data;
    },

    async getJournalEntryById(entryId: string): Promise<PlotJournalEntryDetail> {
      const { data } = await client.GET("/v1/plots/journal/byId/{entryId}", {
        params: { path: { entryId } },
      });
      return data!.data;
    },

    async updateJournalEntry(
      entryId: string,
      body: components["schemas"]["PatchV1PlotsJournalByIdEntryIdRequestBody"],
    ): Promise<components["schemas"]["PatchV1PlotsJournalByIdEntryIdPositiveResponse"]["data"]> {
      const { data } = await client.PATCH("/v1/plots/journal/byId/{entryId}", {
        params: { path: { entryId } },
        body,
      });
      return data!.data;
    },

    async deleteJournalEntry(entryId: string): Promise<void> {
      await client.DELETE("/v1/plots/journal/byId/{entryId}", {
        params: { path: { entryId } },
      });
    },

    async getImageSignedUrl(
      journalEntryId: string,
      filename: string,
    ): Promise<{ signedUrl: string; path: string }> {
      const { data } = await client.POST("/v1/plots/journal/images/signedUrl", {
        body: { journalEntryId, filename },
      });
      return data!.data;
    },

    async registerImage(
      journalEntryId: string,
      storagePath: string,
    ): Promise<PlotJournalImage> {
      const { data } = await client.POST("/v1/plots/journal/images", {
        body: { journalEntryId, storagePath },
      });
      return data!.data;
    },

    async deleteImage(imageId: string): Promise<void> {
      await client.DELETE("/v1/plots/journal/images/byId/{imageId}", {
        params: { path: { imageId } },
      });
    },
  };
}
