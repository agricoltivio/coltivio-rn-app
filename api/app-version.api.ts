import { FetchClient } from "./api";
import type { components } from "./v1";

export type AppVersionInfo =
  components["schemas"]["GetV1AppVersionPositiveResponse"]["data"];

export function appVersionApi(client: FetchClient) {
  return {
    async getAppVersion(): Promise<AppVersionInfo> {
      const { data } = await client.GET("/v1/app-version");
      return data!.data;
    },
  };
}
