export default {
  name: "coltivio",
  slug: "coltivio",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: process.env.SCHEME,
  userInterfaceStyle: "automatic",
  newArchEnabled: false,
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: process.env.IOS_BUNDLE_IDENTIFIER,
    config: {
      googleMapsApiKey: process.env.IOS_GOOGLE_MAPS_API_KEY,
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    usesAppleSignIn: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/images/icon.png",
      backgroundColor: "#ffffff",
    },
    package: process.env.ANDROID_PACKAGE,
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
  ],
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
};
