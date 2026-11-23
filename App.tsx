import { apiErrorMessage } from "@/utils/api-error-message";
import * as Linking from "expo-linking";
import { coltivioTheme } from "@/theme/theme";
import { PortalProvider } from "@gorhom/portal";
import {
  getStateFromPath,
  NavigationContainer,
} from "@react-navigation/native";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import React from "react";
import { Alert, AppState, type AppStateStatus } from "react-native";
import { I18nextProvider } from "react-i18next";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { ThemeProvider } from "styled-components";
import { ApiError } from "./api/api";
import { SessionProvider } from "./auth/SessionProvider";
import { ActiveFarmProvider } from "./features/farms/ActiveFarmContext";
import { OnboardingProvider } from "./features/onboarding/OnboardingContext";
import i18n from "./locales/i18n";
import { RootStack } from "./navigation/RootStack";
import { RootErrorFallback } from "./components/errors/RootErrorFallback";
import { PushNotificationsHandler } from "./features/notifications/PushNotificationsHandler";

import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocalSettingsProvider } from "./features/user/LocalSettingsContext";
import { KeyboardProvider } from "react-native-keyboard-controller";
import * as Sentry from "@sentry/react-native";
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

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      // true: the screen catches the error itself (mutateAsync in try/catch, mutate(..., { onError })).
      // false: the mutation's own onError only rolls back an optimistic update, still show the alert.
      // Unset: a mutation with an onError handles the error, one without gets the alert.
      handlesError?: boolean;
    };
  }
}

const queryClient = new QueryClient({
  // A failed save, edit or delete reports to Sentry and tells the user, unless the screen
  // handles the error itself (see handlesError above)
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      const handledByScreen =
        mutation.meta?.handlesError ?? mutation.options.onError !== undefined;
      if (handledByScreen) return;
      // Rejections by the API (validation, conflicts, expired session) are expected and only
      // need the alert; everything else is reported. A 401 gets the alert too: with a merely
      // stale token the user stays on the screen and would otherwise get no feedback.
      const isExpectedRejection =
        error instanceof ApiError && error.status >= 400 && error.status < 500;
      if (!isExpectedRejection) Sentry.captureException(error);
      // A rejection with a known error code gets its own message, e.g. an overlapping crop rotation
      Alert.alert(
        i18n.t("common.error"),
        apiErrorMessage(error, i18n.t("errors.unexpected_retry"), i18n.t),
      );
    },
  }),
  defaultOptions: {
    queries: {
      // A rejection by the API (not found, forbidden, invalid) won't change on a retry, e.g. the
      // details query of an entry that was just deleted. Everything else keeps the default 3 retries.
      // 401 still retries: a stale token is refreshed meanwhile and the retry uses the new one.
      // 408 and 429 are temporary as well.
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500 &&
          ![401, 408, 429].includes(error.status)
        ) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

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
    // Last resort for errors outside the screens (providers, navigation container)
    <Sentry.ErrorBoundary
      handled={false}
      fallback={({ resetError }) => <RootErrorFallback onRetry={resetError} />}
    >
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
                                  {/* React Native 0.88 always draws edge-to-edge, so the status bar is translucent
                                    without the removed translucent/backgroundColor props */}
                                  <StatusBar barStyle="dark-content" />
                                  <RootStack />
                                  {/* After RootStack so its navigator is mounted before a notification tap navigates */}
                                  <PushNotificationsHandler />
                                </NavigationContainer>
                              </KeyboardProvider>
                            </GestureHandlerRootView>
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
    </Sentry.ErrorBoundary>
  );
});
