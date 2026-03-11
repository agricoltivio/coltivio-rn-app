import { FetchClient } from "./api";
import { components } from "./v1";

export type WikiEntry =
  components["schemas"]["GetV1WikiPositiveResponse"]["data"]["result"][number];

export type WikiMyEntry =
  components["schemas"]["GetV1WikiMyEntriesPositiveResponse"]["data"]["result"][number];

export type WikiEntryDetail =
  components["schemas"]["GetV1WikiByIdEntryIdPositiveResponse"]["data"];

export type WikiCategory =
  components["schemas"]["GetV1WikiCategoriesPositiveResponse"]["data"]["result"][number];

export type WikiChangeRequestItem =
  components["schemas"]["GetV1WikiMyChangeRequestsPositiveResponse"]["data"]["result"][number];

export type WikiChangeRequestNote =
  components["schemas"]["GetV1WikiMyChangeRequestDraftsByIdChangeRequestIdNotesPositiveResponse"]["data"]["result"][number];

export type WikiTranslationInput = {
  locale: "de" | "en" | "it" | "fr";
  title: string;
  body: string;
};

export function wikiApi(client: FetchClient) {
  return {
    async getPublicEntries(): Promise<WikiEntry[]> {
      const { data } = await client.GET("/v1/wiki");
      return data!.data.result;
    },

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

    async submitEntry(entryId: string): Promise<void> {
      await client.POST("/v1/wiki/byId/{entryId}/submit", {
        params: { path: { entryId } },
        body: {},
      });
    },

    async deleteEntry(entryId: string): Promise<void> {
      await client.DELETE("/v1/wiki/byId/{entryId}", {
        params: { path: { entryId } },
      });
    },

    async createChangeRequest(
      entryId: string,
      translations: WikiTranslationInput[],
    ): Promise<void> {
      await client.POST("/v1/wiki/byId/{entryId}/changeRequest", {
        params: { path: { entryId } },
        body: { translations },
      });
    },

    async getMyChangeRequests(): Promise<WikiChangeRequestItem[]> {
      const { data } = await client.GET("/v1/wiki/myChangeRequests");
      return data!.data.result;
    },

    async updateChangeRequestDraft(
      changeRequestId: string,
      body: {
        translations?: WikiTranslationInput[];
        proposedCategoryId?: string;
      },
    ): Promise<WikiChangeRequestItem> {
      const { data } = await client.PATCH(
        "/v1/wiki/myChangeRequestDrafts/byId/{changeRequestId}",
        {
          params: { path: { changeRequestId } },
          body,
        },
      );
      return data!.data;
    },

    async submitChangeRequestDraft(changeRequestId: string): Promise<void> {
      await client.POST(
        "/v1/wiki/myChangeRequestDrafts/byId/{changeRequestId}/submit",
        {
          params: { path: { changeRequestId } },
          body: {},
        },
      );
    },

    async getChangeRequestNotes(
      changeRequestId: string,
    ): Promise<WikiChangeRequestNote[]> {
      const { data } = await client.GET(
        "/v1/wiki/myChangeRequestDrafts/byId/{changeRequestId}/notes",
        {
          params: { path: { changeRequestId } },
        },
      );
      return data!.data.result;
    },

    async addChangeRequestNote(
      changeRequestId: string,
      body: string,
    ): Promise<WikiChangeRequestNote> {
      const { data } = await client.POST(
        "/v1/wiki/myChangeRequestDrafts/byId/{changeRequestId}/notes",
        {
          params: { path: { changeRequestId } },
          body: { body },
        },
      );
      return data!.data;
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
    ): Promise<{ id: string; publicUrl: string }> {
      const { data } = await client.POST("/v1/wiki/images", {
        body: { entryId, storagePath },
      });
      return data!.data;
    },
  };
}
