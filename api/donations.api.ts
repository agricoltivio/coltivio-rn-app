import { FetchClient } from "./api";
import { components } from "./v1";

export type Donation =
  components["schemas"]["GetV1DonationsPositiveResponse"]["data"]["result"][number];

export function donationsApi(client: FetchClient) {
  return {
    async createIntent(amountRappen: number, email: string): Promise<string> {
      const { data } = await client.POST("/v1/donations/intent", {
        body: { amount: amountRappen, email },
      });
      return data!.data.paymentIntentClientSecret;
    },

    async getDonations(): Promise<Donation[]> {
      const { data } = await client.GET("/v1/donations");
      return data!.data.result;
    },
  };
}
