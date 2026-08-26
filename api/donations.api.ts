import { FetchClient } from "./api";

export function donationsApi(client: FetchClient) {
  return {
    async createCheckoutSession(
      amountRappen: number,
      email: string,
      successUrl: string,
      cancelUrl: string,
    ): Promise<string> {
      const { data } = await client.POST("/v1/donations/checkout", {
        body: { amount: amountRappen, email, successUrl, cancelUrl },
      });
      return data!.data.url;
    },
  };
}
