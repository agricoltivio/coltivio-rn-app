import { ApplePayParams, GooglePayParams } from "@stripe/stripe-react-native";

const MERCHANT_COUNTRY_CODE = "CH";

export const applePayParams: ApplePayParams = {
  merchantCountryCode: MERCHANT_COUNTRY_CODE,
};

export const googlePayParams: GooglePayParams = {
  merchantCountryCode: MERCHANT_COUNTRY_CODE,
  // Google Pay's own test/production split is separate from Stripe's — key off the same
  // publishable key prefix Stripe itself uses, so both stay in sync automatically.
  testEnv: !process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_live_"),
};
