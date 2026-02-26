export default ({ config }) => {
  const variant = process.env.APP_VARIANT;
  return {
    ...config,
    name: "coltivio",
    slug: "coltivio",
    owner: "agricoltivio",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: process.env.SCHEME,
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
      config: {
        googleMapsApiKey: process.env.IOS_GOOGLE_MAPS_API_KEY,
      },
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
      config: {
        googleMaps: {
          apiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY,
        },
      },
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
            compileSdkVersion: 35,
            targetSdkVersion: 35,
            buildToolsVersion: "35.0.0",
          },
          // ios: {
          //   deploymentTarget: "15.1",
          // },
        },
      ],
      "@maplibre/maplibre-react-native",
      // [
      //   "react-native-maps",
      //   {
      //     iosGoogleMapsApiKey: process.env.IOS_GOOGLE_MAPS_API_KEY,
      //     androidGoogleMapsApiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY,
      //   },
      // ],
      // "./react-native-maps-fix-plugin",
    ],
    extra: {
      eas: {
        projectId: "da7e669a-079a-440b-bb10-c7f02365614a",
      },
    },
  };
};
