import { FetchClient } from "./api";
import { components } from "./v1";

export type User = components["schemas"]["GetV1MePositiveResponse"]["data"];
export type UpdateUserInput = components["schemas"]["PatchV1MeRequestBody"];

export function userApi(client: FetchClient) {
  return {
    async getLoggedInUser() {
      const { data } = await client.GET("/v1/me");
      return data!.data;
    },
    async updateUser(user: UpdateUserInput) {
      const { data } = await client.PATCH("/v1/me", {
        body: user,
      });
      return data!.data;
    },
  };
}
