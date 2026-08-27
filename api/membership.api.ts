import { FetchClient } from "./api";
import { components } from "./v1";

export type MembershipStatus =
  components["schemas"]["GetV1MembershipStatusPositiveResponse"]["data"];

export type MembershipPayment =
  components["schemas"]["GetV1MembershipPaymentsPositiveResponse"]["data"]["result"][number];

export type PaymentIntentSheetParams = {
  paymentIntentClientSecret: string;
  customerId: string;
  ephemeralKeySecret: string;
};

export type SetupIntentSheetParams = {
  setupIntentClientSecret: string;
  customerId: string;
  ephemeralKeySecret: string;
};

export function membershipApi(client: FetchClient) {
  return {
    async getMembershipStatus(): Promise<MembershipStatus> {
      const { data } = await client.GET("/v1/membership/status");
      return data!.data;
    },

    async createSubscriptionIntent(): Promise<PaymentIntentSheetParams> {
      const { data } = await client.POST("/v1/membership/subscription/intent", {
        body: {},
      });
      return data!.data;
    },

    async createManualIntent(): Promise<PaymentIntentSheetParams> {
      const { data } = await client.POST("/v1/membership/manual/intent", {
        body: {},
      });
      return data!.data;
    },

    async createPaymentMethodIntent(): Promise<SetupIntentSheetParams> {
      const { data } = await client.POST(
        "/v1/membership/paymentMethod/intent",
        {
          body: {},
        },
      );
      return data!.data;
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

    async disableAutoRenew(): Promise<{ cancelAtPeriodEnd: boolean }> {
      const { data } = await client.DELETE(
        "/v1/membership/subscription/autoRenew",
      );
      return data!.data;
    },

    async getPayments(): Promise<MembershipPayment[]> {
      const { data } = await client.GET("/v1/membership/payments");
      return data!.data.result;
    },
  };
}
