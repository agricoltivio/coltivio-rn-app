import { FetchClient } from "./api";
import { components } from "./v1";

export type User = components["schemas"]["GetV1MePositiveResponse"]["data"];

export function userApi(client: FetchClient) {
  return {
    async getLoggedInUser() {
      const { data } = await client.GET("/v1/me");
      return data!.data;
    },
  };
}
