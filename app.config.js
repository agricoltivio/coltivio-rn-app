export default ({ config }) => {
  const variant = process.env.APP_VARIANT;
  // "demo" gets its own package so it installs alongside the regular app, used
  // to show the Bio Suisse pilot without replacing the main install.
  const isDemo = variant === "demo";
  return {
    ...config,
    name: isDemo ? "Coltivio Demo" : "coltivio",
    slug: "coltivio",
    owner: "agricoltivio",
    version: "1.0.3",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    // Distinct per variant so the dev/test build never collides with production's URL scheme
    // (a shared scheme across installed variants breaks ASWebAuthenticationSession redirects,
    // e.g. Stripe checkout — iOS can't unambiguously route the callback).
    scheme: isDemo
      ? "ch.agricoltivio.coltiviodemo"
      : variant === "development"
        ? "ch.agricoltivio.coltiviotest"
        : "ch.agricoltivio.coltivio",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      ...config.ios,
      supportsTablet: false,
      // iOS 18 picks the variant that matches the home screen appearance.
      // Light is the mark on white, dark is the reversed mark on the brand
      // gradient. No tinted variant, iOS derives one from the light icon.
      icon: {
        light: "./assets/images/icon.png",
        dark: "./assets/images/icon-dark.png",
      },
      bundleIdentifier: isDemo
        ? "ch.agricoltivio.coltiviodemo"
        : variant === "development"
          ? "ch.agricoltivio.coltiviotest"
          : "ch.agricoltivio.coltivio",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        // Opt out of iOS 26 Liquid Glass: it wraps headerRight icons in a
        // floating capsule that has an upstream react-native-screens layout
        // bug where it randomly stretches to near-full header width.
        UIDesignRequiresCompatibility: true,
      },
      usesAppleSignIn: true,
      privacyManifest: "./privacy-manifest.json",
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        // Tinted background for the demo build, so the two installs are
        // distinguishable on the home screen at a glance.
        backgroundColor: isDemo ? "#e8f0d8" : "#ffffff",
      },
      package: isDemo
        ? "ch.agricoltivio.coltiviodemo"
        : variant === "development"
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
      // The native splash can only centre one image on a solid colour, so it
      // just holds the brand ground and the mark. SplashView takes over from
      // there and draws the full composition (gradient, wordmark, line art).
      // imageWidth is sized to match the mark SplashView draws (20% of the
      // screen width, so roughly 85dp on a typical phone). The mark still
      // moves up on handover, but it does not also change size.
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          backgroundColor: "#2a5159",
          imageWidth: 85,
          dark: {
            image: "./assets/images/splash-icon.png",
            backgroundColor: "#2a5159",
          },
        },
      ],
      "expo-localization",
      "expo-secure-store",
      "expo-font",
      "expo-location",
      "expo-apple-authentication",
      "@react-native-community/datetimepicker",
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "merchant.ch.agricoltivio.coltivio",
          enableGooglePay: true,
        },
      ],
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
