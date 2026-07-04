import { FetchClient } from "./api";
import { components } from "./v1";

export type WikiMyEntry =
  components["schemas"]["GetV1WikiMyEntriesPositiveResponse"]["data"]["result"][number];

export type WikiEntryDetail =
  components["schemas"]["GetV1WikiByIdEntryIdPositiveResponse"]["data"];

export type WikiCategory =
  components["schemas"]["GetV1WikiCategoriesPositiveResponse"]["data"]["result"][number];

export type WikiTranslationInput = {
  locale: "de" | "en" | "it" | "fr";
  title: string;
  body: string;
};

export function wikiApi(client: FetchClient) {
  return {
    async getMyEntries(): Promise<WikiMyEntry[]> {
      const { data } = await client.GET("/v1/wiki/myEntries");
      return data!.data.result;
    },

    async getEntryById(entryId: string): Promise<WikiEntryDetail> {
      const { data } = await client.GET("/v1/wiki/byId/{entryId}", {
        params: {
          path: { entryId },
        },
      });
      return data!.data;
    },

    async getCategories(): Promise<WikiCategory[]> {
      const { data } = await client.GET("/v1/wiki/categories");
      return data!.data.result;
    },

    async createEntry(body: {
      id?: string;
      categoryId: string;
      translations: WikiTranslationInput[];
    }): Promise<WikiEntryDetail> {
      const { data } = await client.POST("/v1/wiki", { body });
      return data!.data;
    },

    async updateEntry(
      entryId: string,
      body: {
        categoryId?: string;
        translations?: WikiTranslationInput[];
      },
    ): Promise<WikiEntryDetail> {
      const { data } = await client.PATCH("/v1/wiki/byId/{entryId}", {
        params: { path: { entryId } },
        body,
      });
      return data!.data;
    },

    async deleteEntry(entryId: string): Promise<void> {
      await client.DELETE("/v1/wiki/byId/{entryId}", {
        params: { path: { entryId } },
      });
    },

    async getImageSignedUrl(
      entryId: string,
      filename: string,
    ): Promise<{ signedUrl: string; path: string }> {
      const { data } = await client.POST("/v1/wiki/images/signedUrl", {
        body: { entryId, filename },
      });
      return data!.data;
    },

    async registerImage(
      entryId: string,
      storagePath: string,
    ): Promise<{ id: string; signedUrl: string }> {
      const { data } = await client.POST("/v1/wiki/images", {
        body: { entryId, storagePath },
      });
      return data!.data;
    },
  };
}
