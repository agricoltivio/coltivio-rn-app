import { FetchClient } from "./api";
import { components } from "./v1";

export type FertilizerSpreader =
  components["schemas"]["GetV1FertilizerSpreadersPositiveResponse"]["data"]["result"][number];

export type FertilizerSpreaderUpdateInput =
  components["schemas"]["PatchV1FertilizerSpreadersByIdFertilizerSpreaderIdRequestBody"];

export type FertilizerSpreaderCreateInput =
  components["schemas"]["PostV1FertilizerSpreadersRequestBody"];

export function fertilizerSpreadersApi(client: FetchClient) {
  return {
    async getFertilizerSpreaders(): Promise<FertilizerSpreader[]> {
      const { data } = await client.GET("/v1/fertilizerSpreaders");
      return data!.data.result;
    },
    async getFertilizerSpreaderById(
      fertilizerSpreaderId: string
    ): Promise<FertilizerSpreader> {
      const { data } = await client.GET(
        "/v1/fertilizerSpreaders/byId/{fertilizerSpreaderId}",
        {
          params: {
            path: {
              fertilizerSpreaderId,
            },
          },
        }
      );
      return data!.data;
    },

    async createFertilizerSpreader(
      fertilizerSpreader: FertilizerSpreaderCreateInput
    ): Promise<FertilizerSpreader> {
      const { data } = await client.POST("/v1/fertilizerSpreaders", {
        body: fertilizerSpreader,
      });
      return data!.data;
    },

    async updateFertilizerSpreader(
      fertilizerSpreaderId: string,
      fertilizerSpreader: FertilizerSpreaderUpdateInput
    ): Promise<FertilizerSpreader> {
      const { data } = await client.PATCH(
        "/v1/fertilizerSpreaders/byId/{fertilizerSpreaderId}",
        {
          params: {
            path: {
              fertilizerSpreaderId,
            },
          },
          body: fertilizerSpreader,
        }
      );
      return data!.data;
    },
    async deleteFertilizerSpreader(fertilizerSpreaderId: string) {
      const { data } = await client.DELETE(
        "/v1/fertilizerSpreaders/byId/{fertilizerSpreaderId}",
        {
          params: {
            path: {
              fertilizerSpreaderId,
            },
          },
        }
      );
      return data!.data;
    },
  };
}
