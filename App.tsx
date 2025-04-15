import * as Linking from "expo-linking";
import { coltivioTheme } from "@/theme/theme";
import { PortalProvider } from "@gorhom/portal";
import {
  getStateFromPath,
  NavigationContainer,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { I18nextProvider } from "react-i18next";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import { ThemeProvider } from "styled-components";
import { SessionProvider } from "./auth/SessionProvider";
import { OnboardingProvider } from "./features/onboarding/OnboardingContext";
import i18n from "./locales/i18n";
import { RootStack } from "./navigation/RootStack";
import "./theme/theme";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocalSettingsProvider } from "./features/user/LocalSettingsContext";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StatusBar } from "react-native";
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: "https://9c83469da59d07c1442766ef1f55abd0@o4509156353638400.ingest.de.sentry.io/4509156358488144",

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
  enabled: process.env.EXPO_PUBLIC_SENTRY_DISABLED === "true",

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// TODO: remove this once issue is resolved
// configureReanimatedLogger({
//   level: ReanimatedLogLevel.warn,
//   strict: false, // Reanimated runs in strict mode by default
// });

const prefix = Linking.createURL("/");

const queryClient = new QueryClient();

export default Sentry.wrap(function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider theme={coltivioTheme}>
            <QueryClientProvider client={queryClient}>
              <SessionProvider>
                <LocalSettingsProvider>
                  <PortalProvider>
                    <OnboardingProvider>
                      <GestureHandlerRootView>
                        <KeyboardProvider>
                          <NavigationContainer
                            linking={{
                              prefixes: [prefix],
                              getStateFromPath: (path, config) => {
                                const sanitizedPath = path.replace("#", "?");
                                return getStateFromPath(sanitizedPath, config);
                              },
                            }}
                          >
                            <StatusBar
                              barStyle="dark-content"
                              backgroundColor="#f6f6f6"
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
              </SessionProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </I18nextProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
});
