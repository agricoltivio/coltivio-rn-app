import { FetchClient } from "./api";
import { components } from "./v1";

export type Meadow =
  components["schemas"]["GetV1MeadowsPositiveResponse"]["data"]["result"][number];

export type MeadowCreateInput =
  components["schemas"]["PostV1MeadowsRequestBody"];

export type MeadowUpdateInput =
  components["schemas"]["PatchV1MeadowsByIdMeadowIdRequestBody"];

export type MeadowUsageEntry =
  components["schemas"]["GetV1MeadowsByIdMeadowIdUsagePositiveResponse"]["data"]["result"][number];

export function meadowsApi(client: FetchClient) {
  return {
    // Archived meadows are left out unless includeArchived is set
    async getMeadows(includeArchived: boolean = false): Promise<Meadow[]> {
      const { data } = await client.GET("/v1/meadows", {
        params: {
          query: { includeArchived: includeArchived ? "true" : "false" },
        },
      });
      return data!.data.result;
    },

    async getMeadowById(meadowId: string): Promise<Meadow> {
      const { data } = await client.GET("/v1/meadows/byId/{meadowId}", {
        params: { path: { meadowId } },
      });
      return data!.data;
    },

    async createMeadow(input: MeadowCreateInput): Promise<Meadow> {
      const { data } = await client.POST("/v1/meadows", { body: input });
      return data!.data;
    },

    async updateMeadow(
      meadowId: string,
      input: MeadowUpdateInput,
    ): Promise<Meadow> {
      const { data } = await client.PATCH("/v1/meadows/byId/{meadowId}", {
        params: { path: { meadowId } },
        body: input,
      });
      return data!.data;
    },

    async deleteMeadow(meadowId: string) {
      await client.DELETE("/v1/meadows/byId/{meadowId}", {
        params: { path: { meadowId } },
      });
    },

    async getMeadowUsage(
      meadowId: string,
      fromDate: string,
      toDate: string,
    ): Promise<MeadowUsageEntry[]> {
      const { data } = await client.GET("/v1/meadows/byId/{meadowId}/usage", {
        params: { path: { meadowId }, query: { fromDate, toDate } },
      });
      return data!.data.result;
    },
  };
}
