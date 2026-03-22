import { FetchClient } from "./api";
import { components } from "./v1";

export type Farm = components["schemas"]["GetV1FarmPositiveResponse"]["data"];
export type FarmCreated =
  components["schemas"]["PostV1FarmPositiveResponse"]["data"];
export type FarmCreateInput = components["schemas"]["PostV1FarmRequestBody"];
export type FarmUpdateInput = components["schemas"]["PatchV1FarmRequestBody"];
export type AcceptInviteResult =
  components["schemas"]["PostV1FarmInvitesAcceptPositiveResponse"]["data"];
export type FarmInvite =
  components["schemas"]["GetV1FarmInvitesPositiveResponse"]["data"]["result"][number];

export function farmApi(client: FetchClient) {
  return {
    async createFarm(farm: FarmCreateInput): Promise<FarmCreated> {
      const { data } = await client.POST("/v1/farm", { body: farm });
      return data!.data;
    },

    async getFarm(): Promise<Farm> {
      const { data } = await client.GET(`/v1/farm`);
      return data!.data;
    },

    async updateFarm(farm: FarmUpdateInput) {
      const { data } = await client.PATCH(`/v1/farm`, {
        body: farm,
      });
      return data!.data;
    },

    async deleteFarm(deleteAccount: boolean = false) {
      await client.DELETE("/v1/farm", {
        params: {
          query: {
            deleteAccount: deleteAccount ? "true" : "false",
          },
        },
      });
    },

    async acceptInvite(code: string): Promise<AcceptInviteResult> {
      const { data } = await client.POST("/v1/farm/invites/accept", {
        body: { code },
      });
      return data!.data;
    },

    async createInvite(email: string): Promise<FarmInvite> {
      const { data } = await client.POST("/v1/farm/invites", {
        body: { email },
      });
      return data!.data;
    },

    async getInvites(): Promise<FarmInvite[]> {
      const { data } = await client.GET("/v1/farm/invites");
      return data!.data.result;
    },

    async revokeInvite(inviteId: string): Promise<void> {
      await client.DELETE("/v1/farm/invites/byId/{inviteId}", {
        params: { path: { inviteId } },
      });
    },

    async removeMember(userId: string): Promise<void> {
      await client.DELETE("/v1/farm/members/byId/{userId}", {
        params: { path: { userId } },
      });
    },

    async updateMemberRole(
      userId: string,
      role: "owner" | "member",
    ): Promise<void> {
      await client.PATCH("/v1/farm/members/byId/{userId}/role", {
        params: { path: { userId } },
        body: { role },
      });
    },
  };
}
