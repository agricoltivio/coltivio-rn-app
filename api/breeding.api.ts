import { FetchClient } from "./api";
import { components } from "./v1";

export type AnimalWeight =
  components["schemas"]["GetV1AnimalsByIdAnimalIdWeightsPositiveResponse"]["data"]["result"][number];
export type AnimalWeightCreateInput =
  components["schemas"]["PostV1AnimalsByIdAnimalIdWeightsRequestBody"];
export type AnimalWeightUpdateInput =
  components["schemas"]["PatchV1AnimalsWeightsByIdWeightIdRequestBody"];

export type AnimalHeat =
  components["schemas"]["GetV1AnimalsByIdAnimalIdHeatsPositiveResponse"]["data"]["result"][number];
export type AnimalHeatCreateInput =
  components["schemas"]["PostV1AnimalsByIdAnimalIdHeatsRequestBody"];
export type AnimalHeatUpdateInput =
  components["schemas"]["PatchV1AnimalsHeatsByIdHeatIdRequestBody"];

export type BreedingCalendarEntry =
  components["schemas"]["GetV1AnimalsBreedingCalendarPositiveResponse"]["data"]["result"][number];
export type GestationSetting =
  components["schemas"]["GetV1AnimalsBreedingCalendarGestationSettingsPositiveResponse"]["data"]["result"][number];
export type GestationSettingsUpdateInput =
  components["schemas"]["PutV1AnimalsBreedingCalendarGestationSettingsRequestBody"];

export function breedingApi(client: FetchClient) {
  return {
    async getWeights(animalId: string): Promise<AnimalWeight[]> {
      const { data } = await client.GET("/v1/animals/byId/{animalId}/weights", {
        params: { path: { animalId } },
      });
      return data!.data.result;
    },

    async createWeight(
      animalId: string,
      body: AnimalWeightCreateInput,
    ): Promise<AnimalWeight> {
      const { data } = await client.POST(
        "/v1/animals/byId/{animalId}/weights",
        { params: { path: { animalId } }, body },
      );
      return data!.data;
    },

    async updateWeight(
      weightId: string,
      body: AnimalWeightUpdateInput,
    ): Promise<AnimalWeight> {
      const { data } = await client.PATCH(
        "/v1/animals/weights/byId/{weightId}",
        { params: { path: { weightId } }, body },
      );
      return data!.data;
    },

    async deleteWeight(weightId: string) {
      await client.DELETE("/v1/animals/weights/byId/{weightId}", {
        params: { path: { weightId } },
      });
    },

    async getHeats(animalId: string): Promise<AnimalHeat[]> {
      const { data } = await client.GET("/v1/animals/byId/{animalId}/heats", {
        params: { path: { animalId } },
      });
      return data!.data.result;
    },

    async createHeat(
      animalId: string,
      body: AnimalHeatCreateInput,
    ): Promise<AnimalHeat> {
      const { data } = await client.POST("/v1/animals/byId/{animalId}/heats", {
        params: { path: { animalId } },
        body,
      });
      return data!.data;
    },

    async updateHeat(
      heatId: string,
      body: AnimalHeatUpdateInput,
    ): Promise<AnimalHeat> {
      const { data } = await client.PATCH("/v1/animals/heats/byId/{heatId}", {
        params: { path: { heatId } },
        body,
      });
      return data!.data;
    },

    async deleteHeat(heatId: string) {
      await client.DELETE("/v1/animals/heats/byId/{heatId}", {
        params: { path: { heatId } },
      });
    },

    async getBreedingCalendar(
      from: string,
      to: string,
    ): Promise<BreedingCalendarEntry[]> {
      const { data } = await client.GET("/v1/animals/breedingCalendar", {
        params: { query: { from, to } },
      });
      return data!.data.result;
    },

    async getGestationSettings(): Promise<GestationSetting[]> {
      const { data } = await client.GET(
        "/v1/animals/breedingCalendar/gestationSettings",
      );
      return data!.data.result;
    },

    async updateGestationSettings(
      body: GestationSettingsUpdateInput,
    ): Promise<GestationSetting[]> {
      const { data } = await client.PUT(
        "/v1/animals/breedingCalendar/gestationSettings",
        { body },
      );
      return data!.data.result;
    },
  };
}
