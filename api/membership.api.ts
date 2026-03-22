import { FetchClient } from "./api";
import { components } from "./v1";

export type MembershipStatus =
  components["schemas"]["GetV1MembershipStatusPositiveResponse"]["data"];

export function membershipApi(client: FetchClient) {
  return {
    async getMembershipStatus(): Promise<MembershipStatus> {
      const { data } = await client.GET("/v1/membership/status");
      return data!.data;
    },

    async createHandoffToken(): Promise<string> {
      const { data } = await client.POST("/v1/auth/handoff", { body: {} });
      return data!.data.token;
    },
  };
}
