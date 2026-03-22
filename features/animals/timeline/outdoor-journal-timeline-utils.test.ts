import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { buildJournalTimelineData } from "./outdoor-journal-timeline-utils";
import type { OutdoorJournalEntry } from "@/api/outdoor-journal.api";

// Pin clock to 2025-06-01 → epoch 2022-01-01 to 2028-12-31, totalDays=2557
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2025, 5, 1));
});

afterEach(() => {
  jest.useRealTimers();
});

const EPOCH_START = new Date(2022, 0, 1);
const MS_PER_DAY = 86_400_000;

function dayOf(dateStr: string): number {
  return Math.floor(
    (new Date(dateStr).getTime() - EPOCH_START.getTime()) / MS_PER_DAY,
  );
}

function makeEntry(
  category: OutdoorJournalEntry["category"],
  startDate: string,
  endDate: string,
  animalCount = 10,
): OutdoorJournalEntry {
  return { category, startDate, endDate, animalCount };
}

describe("buildJournalTimelineData", () => {
  // --- Empty ---

  test("empty array returns placeholder row", () => {
    const result = buildJournalTimelineData([]);
    expect(result.herds).toHaveLength(1);
    expect(result.herds[0].herdId).toBe("_empty");
    expect(result.herds[0].herdName).toBe("–");
    expect(result.herds[0].bars).toHaveLength(0);
  });

  test("empty array: correct epoch structure", () => {
    const result = buildJournalTimelineData([]);
    expect(result.years).toEqual([2022, 2023, 2024, 2025, 2026, 2027, 2028]);
    expect(result.epochStart).toEqual(new Date(2022, 0, 1));
    // 365+365+366+365+365+365+366 = 2557
    expect(result.totalDays).toBe(2557);
  });

  // --- Single entry ---

  test("single entry: correct startDay, endDay, metadata", () => {
    const entry = makeEntry("A1", "2025-05-01T00:00:00.000Z", "2025-05-31T00:00:00.000Z", 42);
    const result = buildJournalTimelineData([entry]);
    expect(result.herds).toHaveLength(1);
    const bar = result.herds[0].bars[0];
    expect(bar.startDay).toBe(dayOf("2025-05-01T00:00:00.000Z"));
    expect(bar.endDay).toBe(dayOf("2025-05-31T00:00:00.000Z"));
    expect(bar.animalCount).toBe(42);
    expect(bar.scheduleId).toBe("A1-0");
    expect(bar.startDate).toBe("2025-05-01T00:00:00.000Z");
    expect(bar.endDate).toBe("2025-05-31T00:00:00.000Z");
    expect(bar.isOpenEnded).toBe(false);
  });

  // --- Multiple entries same category ---

  test("multiple entries same category → one herd row, bars sorted by startDay", () => {
    const entries = [
      makeEntry("B1", "2025-06-01T00:00:00.000Z", "2025-06-15T00:00:00.000Z"),
      makeEntry("B1", "2025-03-01T00:00:00.000Z", "2025-03-31T00:00:00.000Z"),
    ];
    const result = buildJournalTimelineData(entries);
    expect(result.herds).toHaveLength(1);
    expect(result.herds[0].herdId).toBe("B1");
    const bars = result.herds[0].bars;
    expect(bars).toHaveLength(2);
    expect(bars[0].startDay).toBe(dayOf("2025-03-01T00:00:00.000Z"));
    expect(bars[1].startDay).toBe(dayOf("2025-06-01T00:00:00.000Z"));
    expect(bars[0].scheduleId).toBe("B1-1"); // index in original array
    expect(bars[1].scheduleId).toBe("B1-0");
  });

  // --- Multiple categories sorted alphabetically ---

  test("multiple categories sorted alphabetically", () => {
    const entries = [
      makeEntry("D1", "2025-05-01T00:00:00.000Z", "2025-05-31T00:00:00.000Z"),
      makeEntry("A1", "2025-04-01T00:00:00.000Z", "2025-04-30T00:00:00.000Z"),
    ];
    const result = buildJournalTimelineData(entries);
    expect(result.herds).toHaveLength(2);
    expect(result.herds[0].herdId).toBe("A1");
    expect(result.herds[1].herdId).toBe("D1");
  });

  // --- Clamping ---

  test("entry before epoch: startDay clamped to 0", () => {
    const entry = makeEntry("A1", "2019-01-01T00:00:00.000Z", "2022-03-01T00:00:00.000Z");
    const result = buildJournalTimelineData([entry]);
    expect(result.herds[0].bars[0].startDay).toBe(0);
  });

  test("entry after epoch: endDay clamped to totalDays", () => {
    const result = buildJournalTimelineData([
      makeEntry("A1", "2025-01-01T00:00:00.000Z", "2030-12-31T00:00:00.000Z"),
    ]);
    const { totalDays } = result;
    expect(result.herds[0].bars[0].endDay).toBe(totalDays);
  });
});
