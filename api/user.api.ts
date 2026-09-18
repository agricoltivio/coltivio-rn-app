import { FetchClient } from "./api";
import { components } from "./v1";

export type User = components["schemas"]["GetV1MePositiveResponse"]["data"];
export type UpdateUserInput = components["schemas"]["PatchV1MeRequestBody"];
export type DeletionPreviewFarm =
  components["schemas"]["GetV1MeDeletionPreviewPositiveResponse"]["data"]["farms"][number];
export type DeleteAccountInput =
  components["schemas"]["PostV1MeDeletionRequestBody"];
export type FarmUser =
  components["schemas"]["GetV1UsersPositiveResponse"]["data"]["result"][number];

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

    async sendVerificationEmail() {
      const { data, error } = await client.POST("/v1/me/verification-email", {
        body: {},
      });
      if (error) {
        throw error;
      }
      return data!.data;
    },

    async getDeletionPreview(): Promise<DeletionPreviewFarm[]> {
      const { data } = await client.GET("/v1/me/deletion-preview");
      return data!.data.farms;
    },

    async deleteAccount(input: DeleteAccountInput) {
      const { error } = await client.POST("/v1/me/deletion", { body: input });
      if (error) {
        throw new Error(error.error);
      }
    },

    async getFarmUsers(): Promise<FarmUser[]> {
      const { data } = await client.GET("/v1/users");
      return data!.data.result;
    },
  };
}
