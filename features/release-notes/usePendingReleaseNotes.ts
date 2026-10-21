import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { getAppVersion } from "@/utils/app-info";
import { getReleaseNotesBetween } from "./release-notes";

// Release notes the user has not seen yet. Fresh installs are seeded with the
// installed version in LocalSettingsProvider, so only real updates have pending notes.
export function usePendingReleaseNotes() {
  const { localSettings, updateLocalSettings } = useLocalSettings();
  const currentVersion = getAppVersion();
  const lastSeenVersion = localSettings.lastSeenReleaseNotesVersion;
  const pending = getReleaseNotesBetween(lastSeenVersion, currentVersion);

  function markSeen() {
    updateLocalSettings("lastSeenReleaseNotesVersion", currentVersion);
  }

  return { pending, lastSeenVersion, currentVersion, markSeen };
}
