// Each variant installs side by side with its own id, name and icon background:
// test is the standalone release build, dev is the debug build that loads from Metro.
const VARIANTS = {
  production: {
    id: "ch.agricoltivio.coltivio",
    name: "coltivio",
    iconBackground: "#ffffff",
  },
  development: {
    id: "ch.agricoltivio.coltiviotest",
    name: "Coltivio - Test",
    iconBackground: "#f4c95d",
  },
  dev: {
    id: "ch.agricoltivio.coltiviodev",
    name: "Coltivio - Dev",
    iconBackground: "#9fd3e6",
  },
};

export default ({ config }) => {
  const variant =
    VARIANTS[process.env.APP_VARIANT ?? "production"] ?? VARIANTS.production;
  return {
    ...config,
    name: variant.name,
    slug: "coltivio",
    owner: "agricoltivio",
    version: "1.0.5",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    // Distinct per variant so the dev/test build never collides with production's URL scheme
    // (a shared scheme across installed variants breaks ASWebAuthenticationSession redirects,
    // e.g. Stripe checkout — iOS can't unambiguously route the callback).
    scheme: variant.id,
    userInterfaceStyle: "automatic",
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
      bundleIdentifier: variant.id,
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
        // Tinted per variant so every build is recognisable on the home screen,
        // none of them the demo build's #e8f0d8
        backgroundColor: variant.iconBackground,
      },
      package: variant.id,
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
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
      "expo-image",
      "expo-sharing",
      "expo-status-bar",
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
          // uploads the R8 mapping so native Android stack traces stay readable
          experimental_android: { enableAndroidGradlePlugin: true },
        },
      ],
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: "36.0.0",
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
            // stripe-react-native references its optional push-provisioning SDK, which we don't ship
            extraProguardRules:
              "-dontwarn com.stripe.android.pushProvisioning.**",
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
