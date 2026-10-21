import { useApi } from "@/api/api";
import { queryKeys } from "@/cache/query-keys";
import { getAppVersion } from "@/utils/app-info";
import { isNewerVersion } from "@/utils/version";
import { useQuery } from "@tanstack/react-query";
import { Platform } from "react-native";

export function useAppVersionQuery() {
  const api = useApi();
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.appVersion.latest.queryKey,
    queryFn: () => api.appVersion.getAppVersion(),
    // Refetched on foreground once stale (focusManager follows AppState in App.tsx).
    // A failed fetch only means no banner, so don't hammer the API on a flaky launch.
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
  return { appVersionInfo: data, ...rest };
}

export function useAppUpdateStatus() {
  const { appVersionInfo } = useAppVersionQuery();
  const release =
    Platform.OS === "ios" ? appVersionInfo?.ios : appVersionInfo?.android;
  const currentVersion = getAppVersion();
  const latestVersion = release?.version ?? null;
  const minSupportedVersion = release?.minSupportedVersion ?? null;

  return {
    currentVersion,
    latestVersion,
    minSupportedVersion,
    updateAvailable:
      latestVersion !== null && isNewerVersion(latestVersion, currentVersion),
    // Not enforced anywhere yet, ready for a forced-update gate
    updateRequired:
      minSupportedVersion !== null &&
      isNewerVersion(minSupportedVersion, currentVersion),
  };
}
