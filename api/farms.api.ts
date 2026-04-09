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
export type CreateInviteInput =
  components["schemas"]["PostV1FarmInvitesRequestBody"];
export type MemberPermission =
  components["schemas"]["GetV1FarmMembersByIdUserIdPermissionsPositiveResponse"]["data"]["result"][number];
export type PermissionFeature = MemberPermission["feature"];
export type PermissionAccess = "read" | "write";

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

    async createInvite(input: CreateInviteInput): Promise<FarmInvite> {
      const { data } = await client.POST("/v1/farm/invites", {
        body: input,
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

    async getMemberPermissions(userId: string): Promise<MemberPermission[]> {
      const { data } = await client.GET(
        "/v1/farm/members/byId/{userId}/permissions",
        { params: { path: { userId } } },
      );
      return data!.data.result;
    },

    async setMemberPermission(
      userId: string,
      feature: PermissionFeature,
      access: PermissionAccess,
    ): Promise<void> {
      await client.PUT(
        "/v1/farm/members/byId/{userId}/permissions/byFeature/{feature}",
        { params: { path: { userId, feature } }, body: { access } },
      );
    },

    async deleteMemberPermission(
      userId: string,
      feature: PermissionFeature,
    ): Promise<void> {
      await client.DELETE(
        "/v1/farm/members/byId/{userId}/permissions/byFeature/{feature}",
        { params: { path: { userId, feature } } },
      );
    },
  };
}
