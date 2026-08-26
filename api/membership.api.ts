import { FetchClient } from "./api";
import { components } from "./v1";

export type MembershipStatus =
  components["schemas"]["GetV1MembershipStatusPositiveResponse"]["data"];

export type MembershipPayment =
  components["schemas"]["GetV1MembershipPaymentsPositiveResponse"]["data"]["result"][number];

export function membershipApi(client: FetchClient) {
  return {
    async getMembershipStatus(): Promise<MembershipStatus> {
      const { data } = await client.GET("/v1/membership/status");
      return data!.data;
    },

    async createCheckoutSession(
      successUrl: string,
      cancelUrl: string,
    ): Promise<string> {
      const { data } = await client.POST("/v1/membership/checkout/subscription", {
        body: { successUrl, cancelUrl },
      });
      return data!.data.url;
    },

    async createManualCheckoutSession(
      successUrl: string,
      cancelUrl: string,
    ): Promise<string> {
      const { data } = await client.POST("/v1/membership/checkout/manual", {
        body: { successUrl, cancelUrl },
      });
      return data!.data.url;
    },

    async createPaymentMethodSession(
      successUrl: string,
      cancelUrl: string,
    ): Promise<string> {
      const { data } = await client.POST("/v1/membership/paymentMethod", {
        body: { successUrl, cancelUrl },
      });
      return data!.data.url;
    },

    async cancelSubscription(): Promise<{ cancelAtPeriodEnd: boolean }> {
      const { data } = await client.DELETE("/v1/membership/subscription");
      return data!.data;
    },

    async reactivateSubscription(): Promise<{ cancelAtPeriodEnd: boolean }> {
      const { data } = await client.POST("/v1/membership/subscription", {
        body: {},
      });
      return data!.data;
    },

    async getPayments(): Promise<MembershipPayment[]> {
      const { data } = await client.GET("/v1/membership/payments");
      return data!.data.result;
    },
  };
}
