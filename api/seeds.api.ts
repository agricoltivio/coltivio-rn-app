import { FetchClient } from "./api";
import { components } from "./v1";

export type Seed =
  components["schemas"]["GetV1SeedsPositiveResponse"]["data"]["result"][number];

export type SeedCreateInput = components["schemas"]["PostV1SeedsRequestBody"];

export type SeedUpdateInput =
  components["schemas"]["PatchV1SeedsByIdSeedIdRequestBody"];

export type SeedQuantityKind = Seed["quantityKind"];

export function seedsApi(client: FetchClient) {
  return {
    async getSeeds(): Promise<Seed[]> {
      const { data } = await client.GET("/v1/seeds");
      return data!.data.result;
    },
    async getSeedById(seedId: string): Promise<Seed> {
      const { data } = await client.GET("/v1/seeds/byId/{seedId}", {
        params: { path: { seedId } },
      });
      return data!.data;
    },
    async createSeed(seed: SeedCreateInput): Promise<Seed> {
      const { data } = await client.POST("/v1/seeds", { body: seed });
      return data!.data;
    },
    async updateSeed(seedId: string, seed: SeedUpdateInput): Promise<Seed> {
      const { data } = await client.PATCH("/v1/seeds/byId/{seedId}", {
        params: { path: { seedId } },
        body: seed,
      });
      return data!.data;
    },
    async deleteSeed(seedId: string) {
      await client.DELETE("/v1/seeds/byId/{seedId}", {
        params: { path: { seedId } },
      });
    },
    async isSeedInUse(seedId: string): Promise<boolean> {
      const { data } = await client.GET("/v1/seeds/byId/{seedId}/inUse", {
        params: { path: { seedId } },
      });
      return data!.data.inUse;
    },
  };
}
