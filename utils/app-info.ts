import * as Application from "expo-application";
import Constants from "expo-constants";
import { Linking, Platform } from "react-native";

// Production store listing. The test and dev variants have no listing of their
// own, so an update banner on those builds also leads here.
const IOS_APP_STORE_ID = "6744942564";
const ANDROID_PACKAGE = "ch.agricoltivio.coltivio";

// app.config.js version is the source of truth, the native value is the same
// number as set by prebuild and only a fallback.
export function getAppVersion(): string {
  return (
    Constants.expoConfig?.version ??
    Application.nativeApplicationVersion ??
    "0.0.0"
  );
}

export function getBuildNumber(): string | null {
  return Application.nativeBuildVersion;
}

export function formatAppVersion(): string {
  const build = getBuildNumber();
  return build ? `${getAppVersion()} (${build})` : getAppVersion();
}

export async function openStoreListing() {
  if (Platform.OS === "ios") {
    await Linking.openURL(`https://apps.apple.com/app/id${IOS_APP_STORE_ID}`);
    return;
  }
  try {
    await Linking.openURL(`market://details?id=${ANDROID_PACKAGE}`);
  } catch {
    await Linking.openURL(
      `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`,
    );
  }
}
