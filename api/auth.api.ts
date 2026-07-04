import { FetchClient } from "./api";
import { components } from "./v1";

export type LoginInput = components["schemas"]["PostV1AuthLoginRequestBody"];
export type LoginResult =
  components["schemas"]["PostV1AuthLoginPositiveResponse"]["data"];

export function authApi(client: FetchClient) {
  return {
    async login(body: LoginInput): Promise<LoginResult> {
      const { data } = await client.POST("/v1/auth/login", { body });
      return data!.data;
    },
  };
}
