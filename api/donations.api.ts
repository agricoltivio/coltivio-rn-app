import { FetchClient } from "./api";

export function donationsApi(client: FetchClient) {
  return {
    async createIntent(amountRappen: number, email: string): Promise<string> {
      const { data } = await client.POST("/v1/donations/intent", {
        body: { amount: amountRappen, email },
      });
      return data!.data.paymentIntentClientSecret;
    },
  };
}
