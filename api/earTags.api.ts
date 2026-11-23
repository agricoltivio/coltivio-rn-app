import { FetchClient } from "./api";
import { components } from "./v1";

export type EarTag =
  components["schemas"]["GetV1EarTagsPositiveResponse"]["data"]["result"][number];

export type AvailableEarTag =
  components["schemas"]["GetV1EarTagsAvailablePositiveResponse"]["data"]["result"][number];

export type EarTagRangeInput =
  components["schemas"]["PostV1EarTagsRangeRequestBody"];

export function earTagsApi(client: FetchClient) {
  return {
    async getEarTags(): Promise<EarTag[]> {
      const { data } = await client.GET("/v1/earTags");
      return data!.data.result;
    },

    async getAvailableEarTags(): Promise<AvailableEarTag[]> {
      const { data } = await client.GET("/v1/earTags/available");
      return data!.data.result;
    },

    async createEarTagRange(input: EarTagRangeInput) {
      const { data } = await client.POST("/v1/earTags/range", {
        body: input,
      });
      return data!.data;
    },

    // Single tag by id, works for any number format (also imported ones)
    async deleteEarTag(earTagId: string) {
      await client.DELETE("/v1/earTags/byId/{earTagId}", {
        params: { path: { earTagId } },
      });
    },

    // prefix: text in front of the numbers; fromNumber / toNumber are digits then
    async deleteEarTagRange(
      fromNumber: string,
      toNumber: string,
      prefix?: string,
    ) {
      const { data } = await client.DELETE("/v1/earTags/range", {
        params: {
          query: {
            fromNumber,
            toNumber,
            prefix: prefix || undefined,
          },
        },
      });
      return data!.data;
    },

    // Changes the number of one ear tag, also of an assigned one
    async updateEarTagNumber(earTagId: string, number: string) {
      const { data } = await client.PATCH("/v1/earTags/byId/{earTagId}", {
        params: { path: { earTagId } },
        body: { number },
      });
      return data!.data;
    },
  };
}
