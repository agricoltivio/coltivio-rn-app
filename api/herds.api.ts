import { FetchClient } from "./api";
import { components } from "./v1";

export type Herd =
  components["schemas"]["GetV1AnimalsHerdsPositiveResponse"]["data"]["result"][number];

export type HerdDetail =
  components["schemas"]["GetV1AnimalsHerdsByIdHerdIdPositiveResponse"]["data"];

export type HerdCreateInput =
  components["schemas"]["PostV1AnimalsHerdsRequestBody"];

export type HerdUpdateInput =
  components["schemas"]["PatchV1AnimalsHerdsByIdHerdIdRequestBody"];

export type HerdCreateResponse =
  components["schemas"]["PostV1AnimalsHerdsPositiveResponse"]["data"];

export type HerdUpdateResponse =
  components["schemas"]["PatchV1AnimalsHerdsByIdHerdIdPositiveResponse"]["data"];

export type OutdoorSchedule = Herd["outdoorSchedules"][number];
export type OutdoorScheduleType = OutdoorSchedule["type"];

export type OutdoorScheduleCreateInput =
  components["schemas"]["PostV1AnimalsHerdsByIdHerdIdOutdoorSchedulesRequestBody"];

export type OutdoorScheduleUpdateInput =
  components["schemas"]["PatchV1AnimalsHerdsOutdoorSchedulesByIdOutdoorScheduleIdRequestBody"];

export type OutdoorScheduleCreateResponse =
  components["schemas"]["PostV1AnimalsHerdsByIdHerdIdOutdoorSchedulesPositiveResponse"]["data"];

export type OutdoorScheduleUpdateResponse =
  components["schemas"]["PatchV1AnimalsHerdsOutdoorSchedulesByIdOutdoorScheduleIdPositiveResponse"]["data"];

// A date range in which the herd did something else than its schedules say; takes
// precedence over the schedules on those days (e.g. stable for two days)
export type OutdoorScheduleOverride = NonNullable<
  HerdDetail["outdoorScheduleOverrides"]
>[number];

export type OutdoorScheduleOverrideCreateInput =
  components["schemas"]["PostV1AnimalsHerdsByIdHerdIdOutdoorScheduleOverridesRequestBody"];

export type OutdoorScheduleOverrideUpdateInput =
  components["schemas"]["PatchV1AnimalsHerdsOutdoorScheduleOverridesByIdOutdoorScheduleOverrideIdRequestBody"];

export function herdsApi(client: FetchClient) {
  return {
    async getHerds(): Promise<Herd[]> {
      const { data } = await client.GET("/v1/animals/herds");
      return data!.data.result;
    },

    // First day a herd change can take effect for each animal (null: no herd history)
    async getEarliestHerdChangeDates(
      animalIds: string[],
    ): Promise<{ animalId: string; earliestDate: string | null }[]> {
      const { data } = await client.GET(
        "/v1/animals/herds/earliestChangeDates",
        { params: { query: { animalIds } } },
      );
      return data!.data.result;
    },

    async getHerdById(herdId: string): Promise<HerdDetail> {
      const { data } = await client.GET("/v1/animals/herds/byId/{herdId}", {
        params: { path: { herdId } },
      });
      return data!.data;
    },

    async createHerd(input: HerdCreateInput): Promise<HerdCreateResponse> {
      const { data } = await client.POST("/v1/animals/herds", {
        body: input,
      });
      return data!.data;
    },

    async updateHerd(
      herdId: string,
      input: HerdUpdateInput,
    ): Promise<HerdUpdateResponse> {
      const { data } = await client.PATCH("/v1/animals/herds/byId/{herdId}", {
        params: { path: { herdId } },
        body: input,
      });
      return data!.data;
    },

    async deleteHerd(herdId: string) {
      await client.DELETE("/v1/animals/herds/byId/{herdId}", {
        params: { path: { herdId } },
      });
    },

    async getOutdoorSchedules(herdId: string): Promise<OutdoorSchedule[]> {
      const { data } = await client.GET(
        "/v1/animals/herds/byId/{herdId}/outdoorSchedules",
        { params: { path: { herdId } } },
      );
      return data!.data.result;
    },

    async createOutdoorSchedule(
      herdId: string,
      input: OutdoorScheduleCreateInput,
    ): Promise<OutdoorScheduleCreateResponse> {
      const { data } = await client.POST(
        "/v1/animals/herds/byId/{herdId}/outdoorSchedules",
        { params: { path: { herdId } }, body: input },
      );
      return data!.data;
    },

    async updateOutdoorSchedule(
      outdoorScheduleId: string,
      input: OutdoorScheduleUpdateInput,
    ): Promise<OutdoorScheduleUpdateResponse> {
      const { data } = await client.PATCH(
        "/v1/animals/herds/outdoorSchedules/byId/{outdoorScheduleId}",
        { params: { path: { outdoorScheduleId } }, body: input },
      );
      return data!.data;
    },

    async deleteOutdoorSchedule(outdoorScheduleId: string) {
      await client.DELETE(
        "/v1/animals/herds/outdoorSchedules/byId/{outdoorScheduleId}",
        { params: { path: { outdoorScheduleId } } },
      );
    },

    async createOutdoorScheduleOverride(
      herdId: string,
      input: OutdoorScheduleOverrideCreateInput,
    ): Promise<OutdoorScheduleOverride> {
      const { data } = await client.POST(
        "/v1/animals/herds/byId/{herdId}/outdoorScheduleOverrides",
        { params: { path: { herdId } }, body: input },
      );
      return data!.data;
    },

    async updateOutdoorScheduleOverride(
      outdoorScheduleOverrideId: string,
      input: OutdoorScheduleOverrideUpdateInput,
    ): Promise<OutdoorScheduleOverride> {
      const { data } = await client.PATCH(
        "/v1/animals/herds/outdoorScheduleOverrides/byId/{outdoorScheduleOverrideId}",
        { params: { path: { outdoorScheduleOverrideId } }, body: input },
      );
      return data!.data;
    },

    async deleteOutdoorScheduleOverride(outdoorScheduleOverrideId: string) {
      await client.DELETE(
        "/v1/animals/herds/outdoorScheduleOverrides/byId/{outdoorScheduleOverrideId}",
        { params: { path: { outdoorScheduleOverrideId } } },
      );
    },
  };
}
