export default ({ config }) => {
  const variant = process.env.APP_VARIANT;
  return {
    ...config,
    name: "coltivio",
    slug: "coltivio",
    owner: "agricoltivio",
    version: "1.0.3",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    // Distinct per variant so the dev/test build never collides with production's URL scheme
    // (a shared scheme across installed variants breaks ASWebAuthenticationSession redirects,
    // e.g. Stripe checkout — iOS can't unambiguously route the callback).
    scheme:
      variant === "development"
        ? "ch.agricoltivio.coltiviotest"
        : "ch.agricoltivio.coltivio",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      ...config.ios,
      supportsTablet: false,
      bundleIdentifier:
        variant === "development"
          ? "ch.agricoltivio.coltiviotest"
          : "ch.agricoltivio.coltivio",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      usesAppleSignIn: true,
      privacyManifest: "./privacy-manifest.json",
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package:
        variant === "development"
          ? "ch.agricoltivio.coltiviotest"
          : "ch.agricoltivio.coltivio",
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
    },
    experiments: {
      typedRoutes: true,
    },
    plugins: [
      "expo-localization",
      "expo-secure-store",
      "expo-font",
      "expo-location",
      "expo-apple-authentication",
      "@react-native-community/datetimepicker",
      "expo-web-browser",
      [
        "@sentry/react-native/expo",
        {
          url: "https://sentry.io/",
          project: "react-native",
          organization: "agricoltivio",
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: "36.0.0",
          },
          // ios: {
          //   deploymentTarget: "15.1",
          // },
        },
      ],
      "@maplibre/maplibre-react-native",
    ],
    extra: {
      eas: {
        projectId: "da7e669a-079a-440b-bb10-c7f02365614a",
      },
    },
  };
};
