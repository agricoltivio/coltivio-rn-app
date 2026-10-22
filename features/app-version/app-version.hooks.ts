import { queryKeys } from "@/cache/query-keys";
import { getAppVersion } from "@/utils/app-info";
import { APP_VERSION_JSON_URL } from "@/utils/links";
import { compareVersions, isNewerVersion } from "@/utils/version";
import { useQuery } from "@tanstack/react-query";
import { Platform } from "react-native";

type AppPlatform = "ios" | "android";

// Shape of coltivio-landing/src/pages/app-version.json.ts
export type AppRelease = {
  version: string;
  releasedAt: string;
  platforms: AppPlatform[];
  minSupportedVersion: string | null;
};

async function fetchAppReleases(): Promise<AppRelease[]> {
  const response = await fetch(APP_VERSION_JSON_URL);
  if (!response.ok) {
    throw new Error(`app-version.json: ${response.status}`);
  }
  const body = (await response.json()) as { releases: AppRelease[] };
  return body.releases;
}

// Newest release for this platform that is already out. The site is static,
// so an entry can be published ahead of a rollout with a future date.
export function latestReleaseFor(
  releases: AppRelease[],
  platform: AppPlatform,
  now = new Date(),
): AppRelease | null {
  return releases
    .filter(
      (release) =>
        release.platforms.includes(platform) &&
        new Date(release.releasedAt) <= now,
    )
    .reduce<AppRelease | null>(
      (latest, release) =>
        latest === null || compareVersions(release.version, latest.version) > 0
          ? release
          : latest,
      null,
    );
}

export function useLatestAppVersionQuery() {
  return useQuery({
    queryKey: queryKeys.appVersion.latest.queryKey,
    queryFn: fetchAppReleases,
    // Refetched on foreground once stale (focusManager follows AppState in App.tsx).
    // A failed fetch only means no banner, so don't hammer the site on a flaky launch.
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}

export function useAppUpdateStatus() {
  const { data: releases } = useLatestAppVersionQuery();
  const release = releases
    ? latestReleaseFor(releases, Platform.OS === "ios" ? "ios" : "android")
    : null;
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
