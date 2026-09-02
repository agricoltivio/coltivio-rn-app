import * as Linking from "expo-linking";
import { coltivioTheme } from "@/theme/theme";
import { PortalProvider } from "@gorhom/portal";
import {
  getStateFromPath,
  NavigationContainer,
} from "@react-navigation/native";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import React, { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { I18nextProvider } from "react-i18next";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { ThemeProvider } from "styled-components";
import { SessionProvider } from "./auth/SessionProvider";
import { ActiveFarmProvider } from "./features/farms/ActiveFarmContext";
import { OnboardingProvider } from "./features/onboarding/OnboardingContext";
import i18n from "./locales/i18n";
import { RootStack } from "./navigation/RootStack";
import "./theme/theme";

import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocalSettingsProvider } from "./features/user/LocalSettingsContext";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as Sentry from "@sentry/react-native";
import { UrlProvider } from "./utils/url-context";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { handleURLCallback, StripeProvider } from "@stripe/stripe-react-native";

Sentry.init({
  dsn: "https://9c83469da59d07c1442766ef1f55abd0@o4509156353638400.ingest.de.sentry.io/4509156358488144",

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
  enabled: process.env.EXPO_PUBLIC_SENTRY_DISABLED !== "true",

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// TODO: remove this once issue is resolved
// configureReanimatedLogger({
//   level: ReanimatedLogLevel.warn,
//   strict: false, // Reanimated runs in strict mode by default
// });

const prefix = Linking.createURL("/");
// Scheme-only, no path — needed by StripeProvider so payment methods that redirect out for their
// own confirmation (e.g. bank/3DS challenges) can find their way back into the app.
const stripeUrlScheme = Linking.createURL("").replace("://", "");

// Redirect-based payment methods (e.g. Twint, 3DS) reopen the app via `stripeUrlScheme` once
// confirmed. handleURLCallback is how the SDK finds out the redirect happened — without it,
// the native payment sheet never resolves and stays stuck showing the redirect page. It's a
// no-op (returns false) for any URL that isn't a Stripe callback, so it's safe to call for all.
Linking.getInitialURL().then((url) => {
  if (url) handleURLCallback(url);
});
Linking.addEventListener("url", (event) => {
  handleURLCallback(event.url);
});

const queryClient = new QueryClient();

// Wire TanStack Query's focusManager to React Native's AppState so that
// queries refetch when the app returns to the foreground (e.g. after browser redirect).
focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener(
    "change",
    (state: AppStateStatus) => {
      handleFocus(state === "active");
    },
  );
  return () => subscription.remove();
});

export default Sentry.wrap(function App() {
  return (
    <UrlProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider theme={coltivioTheme}>
              <StripeProvider
                publishableKey={
                  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
                }
                urlScheme={stripeUrlScheme}
                merchantIdentifier="merchant.ch.agricoltivio.coltivio"
              >
                <QueryClientProvider client={queryClient}>
                  <SessionProvider>
                    <ActiveFarmProvider>
                      <LocalSettingsProvider>
                        <PortalProvider>
                          <OnboardingProvider>
                            <GestureHandlerRootView>
                              <KeyboardProvider>
                                <NavigationContainer
                                  linking={{
                                    prefixes: [prefix],
                                    getStateFromPath: (path, config) => {
                                      // Stripe's returnURL (e.g. after a Twint/3DS redirect) reopens the app on
                                      // this path. There's no screen for it — the Stripe SDK's own URL listener
                                      // resumes the payment sheet — so don't let react-navigation route it.
                                      if (path.startsWith("stripe-redirect")) {
                                        return undefined;
                                      }
                                      const sanitizedPath = path.replace(
                                        "#",
                                        "?",
                                      );
                                      return getStateFromPath(
                                        sanitizedPath,
                                        config,
                                      );
                                    },
                                  }}
                                >
                                  <StatusBar
                                    barStyle="dark-content"
                                    backgroundColor={coltivioTheme.colors.background}
                                  />
                                  <RootStack />
                                </NavigationContainer>
                              </KeyboardProvider>
                            </GestureHandlerRootView>
                            {/* <ComponentsShowcase /> */}
                            {/* <BottomSheetModalTest /> */}
                          </OnboardingProvider>
                        </PortalProvider>
                      </LocalSettingsProvider>
                    </ActiveFarmProvider>
                  </SessionProvider>
                </QueryClientProvider>
              </StripeProvider>
            </ThemeProvider>
          </I18nextProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </UrlProvider>
  );
});
