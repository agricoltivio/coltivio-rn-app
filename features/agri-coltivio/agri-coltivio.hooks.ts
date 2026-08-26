import { useApi } from "@/api/api";
import { useUserQuery } from "@/features/user/users.hooks";
import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

export function useDonationCheckoutMutation() {
  const api = useApi();
  const { user } = useUserQuery();

  return useMutation({
    mutationFn: async (amountChf: number): Promise<boolean> => {
      if (!user?.email) throw new Error("Missing user email");
      // Redirect back into the app itself (via the app's own URL scheme) instead of a web
      // page — openAuthSessionAsync auto-closes the in-app browser once Stripe redirects here.
      const successUrl = Linking.createURL("donation/success");
      const cancelUrl = Linking.createURL("donation/cancel");
      // Match on the bare scheme rather than the full success path — ASWebAuthenticationSession
      // matching is scheme-based, and this also lets the same call catch the cancel redirect.
      const schemeRedirect = Linking.createURL("");
      // API expects the amount in Rappen (cents), not CHF
      const url = await api.donations.createCheckoutSession(
        Math.round(amountChf * 100),
        user.email,
        successUrl,
        cancelUrl,
      );
      console.log("[donation checkout] opening", {
        url,
        successUrl,
        cancelUrl,
        schemeRedirect,
      });
      const result = await WebBrowser.openAuthSessionAsync(url, schemeRedirect, {
        preferEphemeralSession: true,
      });
      console.log("[donation checkout] result", result);
      return result.type === "success" && result.url.includes("donation/success");
    },
  });
}
