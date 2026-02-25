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

export function herdsApi(client: FetchClient) {
  return {
    async getHerds(): Promise<Herd[]> {
      const { data } = await client.GET("/v1/animals/herds");
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
  };
}
