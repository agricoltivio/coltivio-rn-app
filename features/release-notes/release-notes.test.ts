import { describe, expect, test } from "@jest/globals";
import { compareVersions } from "@/utils/version";
import {
  getReleaseNoteText,
  getReleaseNotesBetween,
  RELEASE_NOTES,
} from "./release-notes";

const LOCALES = ["de", "fr", "it", "en"] as const;

describe("RELEASE_NOTES", () => {
  test("is sorted newest first without duplicates", () => {
    for (let i = 1; i < RELEASE_NOTES.length; i++) {
      expect(
        compareVersions(RELEASE_NOTES[i - 1].version, RELEASE_NOTES[i].version),
      ).toBe(1);
    }
  });

  test("every entry has all four languages filled in", () => {
    for (const note of RELEASE_NOTES) {
      for (const locale of LOCALES) {
        const text = note.notes[locale].trim();
        expect(text.length).toBeGreaterThan(0);
        expect(text).not.toContain("TODO");
      }
    }
  });
});

describe("getReleaseNotesBetween", () => {
  const versions = (lastSeen: string | null, current: string) =>
    getReleaseNotesBetween(lastSeen, current).map((note) => note.version);

  test("null lastSeen returns everything up to current", () => {
    expect(versions(null, "1.0.7")).toEqual(
      RELEASE_NOTES.filter((n) => compareVersions(n.version, "1.0.7") <= 0).map(
        (n) => n.version,
      ),
    );
  });

  test("nothing when lastSeen equals current", () => {
    expect(versions("1.0.7", "1.0.7")).toEqual([]);
  });

  test("nothing on a downgrade", () => {
    expect(versions("9.9.9", "1.0.7")).toEqual([]);
  });

  test("only entries strictly after lastSeen", () => {
    expect(versions("1.0.6", "1.0.7")).toEqual(["1.0.7"]);
    expect(versions("0.0.1", "1.0.6")).toEqual([]);
  });
});

describe("getReleaseNoteText", () => {
  test("falls back to German for unknown locales", () => {
    const note = RELEASE_NOTES[0];
    expect(getReleaseNoteText(note, "en")).toBe(note.notes.en);
    expect(getReleaseNoteText(note, "xx")).toBe(note.notes.de);
  });
});
