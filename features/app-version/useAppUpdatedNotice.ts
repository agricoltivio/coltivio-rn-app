import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { getAppVersion } from "@/utils/app-info";
import { releasesUrl } from "@/utils/links";
import { isNewerVersion } from "@/utils/version";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";

// Once after an update: the app only points to the release notes on the
// website. Fresh installs are seeded with the installed version in
// LocalSettingsProvider, so the notice never shows on a first launch.
export function useAppUpdatedNotice() {
  const { i18n } = useTranslation();
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const currentVersion = getAppVersion();
  const lastSeenVersion = localSettings.lastSeenAppVersion;
  const visible =
    lastSeenVersion !== null && isNewerVersion(currentVersion, lastSeenVersion);

  function markSeen() {
    updateLocalSettings("lastSeenAppVersion", currentVersion);
  }

  function openReleaseNotes() {
    markSeen();
    Linking.openURL(releasesUrl(i18n.language));
  }

  return { visible, currentVersion, markSeen, openReleaseNotes };
}
