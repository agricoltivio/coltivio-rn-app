import { describe, expect, test } from "@jest/globals";
import { AppRelease, latestReleaseFor } from "./app-version.hooks";

const release = (
  version: string,
  releasedAt: string,
  platforms: AppRelease["platforms"] = ["ios", "android"],
): AppRelease => ({
  version,
  releasedAt,
  platforms,
  minSupportedVersion: null,
});

const now = new Date("2026-10-22T12:00:00Z");

describe("latestReleaseFor", () => {
  test("picks the highest version regardless of order", () => {
    const releases = [
      release("1.0.7", "2026-10-01"),
      release("1.0.9", "2026-10-20"),
      release("1.0.8", "2026-10-10"),
    ];
    expect(latestReleaseFor(releases, "ios", now)?.version).toBe("1.0.9");
  });

  test("ignores releases dated in the future", () => {
    const releases = [
      release("1.0.8", "2026-11-01"),
      release("1.0.7", "2026-10-01"),
    ];
    expect(latestReleaseFor(releases, "ios", now)?.version).toBe("1.0.7");
  });

  test("only counts releases for the platform", () => {
    const releases = [
      release("1.0.8", "2026-10-20", ["android"]),
      release("1.0.7", "2026-10-01"),
    ];
    expect(latestReleaseFor(releases, "ios", now)?.version).toBe("1.0.7");
    expect(latestReleaseFor(releases, "android", now)?.version).toBe("1.0.8");
  });

  test("null when nothing is out yet", () => {
    expect(latestReleaseFor([], "ios", now)).toBeNull();
    expect(
      latestReleaseFor([release("1.0.8", "2026-11-01")], "ios", now),
    ).toBeNull();
  });
});
