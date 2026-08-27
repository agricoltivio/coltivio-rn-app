import { useApi } from "@/api/api";
import { useUserQuery } from "@/features/user/users.hooks";
import { usePaymentSheet } from "@stripe/stripe-react-native";
import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { applePayParams, googlePayParams } from "@/utils/stripe";

export function useDonationCheckoutMutation() {
  const api = useApi();
  const { user } = useUserQuery();
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  return useMutation({
    mutationFn: async (amountChf: number): Promise<boolean> => {
      if (!user?.email) throw new Error("Missing user email");
      // API expects the amount in Rappen (cents), not CHF
      const paymentIntentClientSecret = await api.donations.createIntent(
        Math.round(amountChf * 100),
        user.email,
      );

      const returnURL = Linking.createURL("stripe-redirect");
      // No customer/saved payment methods for donations — guest-style checkout.
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "AgriColtivio",
        paymentIntentClientSecret,
        returnURL,
        applePay: applePayParams,
        googlePay: googlePayParams,
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === "Canceled") return false;
        throw new Error(presentError.message);
      }
      return true;
    },
  });
}
