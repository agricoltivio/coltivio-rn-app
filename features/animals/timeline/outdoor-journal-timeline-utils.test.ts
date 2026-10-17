import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  buildJournalTimelineData,
  buildMeadowJournalTimelineData,
} from "./outdoor-journal-timeline-utils";
import type {
  OutdoorJournalEntry,
  OutdoorJournalMeadowEntry,
} from "@/api/outdoor-journal.api";

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
    const entry = makeEntry(
      "A1",
      "2025-05-01T00:00:00.000Z",
      "2025-05-31T00:00:00.000Z",
      42,
    );
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
    const entry = makeEntry(
      "A1",
      "2019-01-01T00:00:00.000Z",
      "2022-03-01T00:00:00.000Z",
    );
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

function makeMeadowEntry(
  meadowId: string,
  meadowName: string,
  herdName: string,
  startDate: string,
  endDate: string,
  animalCount = 10,
): OutdoorJournalMeadowEntry {
  return {
    meadowId,
    meadowName,
    meadowSize: 12000,
    herdId: `herd-${herdName}`,
    herdName,
    type: "pasture",
    startDate,
    endDate,
    animalCount,
    animalCountsByType: { cow: animalCount },
  };
}

describe("buildMeadowJournalTimelineData", () => {
  test("empty array returns placeholder row", () => {
    const result = buildMeadowJournalTimelineData([]);
    expect(result.herds).toHaveLength(1);
    expect(result.herds[0].herdId).toBe("_empty");
    expect(result.herds[0].bars).toHaveLength(0);
    expect(result.totalDays).toBe(2557);
  });

  test("one row per meadow, most recently used on top", () => {
    const result = buildMeadowJournalTimelineData([
      makeMeadowEntry(
        "m1",
        "Allmend",
        "Kühe",
        "2025-05-01T00:00:00.000Z",
        "2025-05-31T00:00:00.000Z",
      ),
      makeMeadowEntry(
        "m2",
        "Zelg",
        "Rinder",
        "2025-06-01T00:00:00.000Z",
        "2025-06-30T00:00:00.000Z",
      ),
    ]);
    // Zelg was used later, so it comes first despite the name
    expect(result.herds.map((row) => row.herdId)).toEqual(["m2", "m1"]);
  });

  test("bars carry herd, meadow and type metadata, sorted by start", () => {
    const result = buildMeadowJournalTimelineData([
      makeMeadowEntry(
        "m1",
        "Allmend",
        "Rinder",
        "2025-07-01T00:00:00.000Z",
        "2025-07-15T00:00:00.000Z",
        5,
      ),
      makeMeadowEntry(
        "m1",
        "Allmend",
        "Kühe",
        "2025-05-01T00:00:00.000Z",
        "2025-05-31T00:00:00.000Z",
        12,
      ),
    ]);
    expect(result.herds).toHaveLength(1);
    const [first, second] = result.herds[0].bars;
    expect(first.herdName).toBe("Kühe");
    expect(first.notes).toBe("Kühe");
    expect(first.animalCount).toBe(12);
    expect(first.scheduleType).toBe("pasture");
    expect(first.meadowName).toBe("Allmend");
    expect(first.meadowSize).toBe(12000);
    expect(first.startDay).toBe(dayOf("2025-05-01T00:00:00.000Z"));
    expect(first.endDay).toBe(dayOf("2025-05-31T00:00:00.000Z"));
    expect(second.herdName).toBe("Rinder");
    expect(first.scheduleId).not.toBe(second.scheduleId);
  });

  test("future stays are flagged; old stays extend the timeline back", () => {
    const result = buildMeadowJournalTimelineData([
      makeMeadowEntry(
        "m1",
        "Allmend",
        "Kühe",
        "2020-05-01T00:00:00.000Z",
        "2026-05-31T00:00:00.000Z",
      ),
      makeMeadowEntry(
        "m1",
        "Allmend",
        "Rinder",
        "2026-06-01T00:00:00.000Z",
        "2026-06-30T00:00:00.000Z",
      ),
    ]);
    const [past, future] = result.herds[0].bars;
    expect(result.years[0]).toBe(2020);
    expect(past.startDay).toBeGreaterThan(0);
    expect(past.isFuture).toBe(false);
    expect(future.isFuture).toBe(true);
  });
});

describe("journal timeline: single-day entries", () => {
  // Local midnight per day, as weekday stays come back from the journal
  function day(dayOfMonth: number): string {
    return new Date(2025, 4, dayOfMonth).toISOString();
  }

  test("consecutive single-day category entries merge into one bar", () => {
    const result = buildJournalTimelineData(
      [5, 6, 7].map((d) => makeEntry("A1", day(d), day(d), 10)),
    );
    const bars = result.herds[0].bars;
    expect(bars).toHaveLength(1);
    expect(bars[0].endDay - bars[0].startDay).toBe(3);
    expect(bars[0].endDate).toBe(day(7));
  });

  test("a single-day entry still covers its own day", () => {
    const result = buildJournalTimelineData([
      makeEntry("A1", day(5), day(5), 10),
    ]);
    const bar = result.herds[0].bars[0];
    expect(bar.endDay - bar.startDay).toBe(1);
  });

  test("entries with a different animal count stay separate", () => {
    const result = buildJournalTimelineData([
      makeEntry("A1", day(5), day(5), 10),
      makeEntry("A1", day(6), day(6), 12),
    ]);
    expect(result.herds[0].bars).toHaveLength(2);
  });

  test("Mo–We weekday stays give one bar per week", () => {
    // 2025-05-05 is a Monday
    const result = buildJournalTimelineData(
      [5, 6, 7, 12, 13, 14].map((d) => makeEntry("A1", day(d), day(d), 10)),
    );
    const bars = result.herds[0].bars;
    expect(bars).toHaveLength(2);
    expect(bars.map((bar) => bar.endDay - bar.startDay)).toEqual([3, 3]);
  });

  test("meadow stays merge per herd, not across herds", () => {
    const result = buildMeadowJournalTimelineData([
      makeMeadowEntry("m1", "Allmend", "Kühe", day(5), day(5)),
      makeMeadowEntry("m1", "Allmend", "Kühe", day(6), day(6)),
      makeMeadowEntry("m1", "Allmend", "Rinder", day(7), day(7)),
    ]);
    const bars = result.herds[0].bars;
    expect(bars).toHaveLength(2);
    expect(bars[0].herdName).toBe("Kühe");
    expect(bars[0].endDay - bars[0].startDay).toBe(2);
    expect(bars[1].herdName).toBe("Rinder");
  });
});

describe("meadow timeline: lanes for herds at the same time", () => {
  function day(dayOfMonth: number): string {
    return new Date(2025, 4, dayOfMonth).toISOString();
  }

  test("a single herd keeps one lane", () => {
    const result = buildMeadowJournalTimelineData([
      makeMeadowEntry("m1", "Allmend", "Kühe", day(1), day(10)),
      makeMeadowEntry("m1", "Allmend", "Kühe", day(20), day(25)),
    ]);
    expect(result.herds[0].laneCount).toBe(1);
    expect(result.herds[0].bars.map((bar) => bar.lane)).toEqual([0, 0]);
  });

  test("overlapping herds go on separate lanes", () => {
    const result = buildMeadowJournalTimelineData([
      makeMeadowEntry("m1", "Allmend", "Kühe", day(1), day(10)),
      makeMeadowEntry("m1", "Allmend", "Rinder", day(5), day(15)),
      makeMeadowEntry("m1", "Allmend", "Schafe", day(8), day(12)),
    ]);
    const row = result.herds[0];
    expect(row.laneCount).toBe(3);
    const laneByHerd = Object.fromEntries(
      row.bars.map((bar) => [bar.herdName, bar.lane]),
    );
    expect(laneByHerd).toEqual({ Kühe: 0, Rinder: 1, Schafe: 2 });
  });

  test("a free lane is reused once the earlier stay ended", () => {
    const result = buildMeadowJournalTimelineData([
      makeMeadowEntry("m1", "Allmend", "Kühe", day(1), day(10)),
      makeMeadowEntry("m1", "Allmend", "Rinder", day(5), day(15)),
      makeMeadowEntry("m1", "Allmend", "Schafe", day(12), day(20)),
    ]);
    const row = result.herds[0];
    expect(row.laneCount).toBe(2);
    expect(row.bars.find((bar) => bar.herdName === "Schafe")?.lane).toBe(0);
  });

  test("a returning herd keeps its previous lane when it is free", () => {
    const result = buildMeadowJournalTimelineData([
      makeMeadowEntry("m1", "Allmend", "Kühe", day(1), day(10)),
      makeMeadowEntry("m1", "Allmend", "Rinder", day(5), day(8)),
      makeMeadowEntry("m1", "Allmend", "Rinder", day(12), day(15)),
    ]);
    const rinderLanes = result.herds[0].bars
      .filter((bar) => bar.herdName === "Rinder")
      .map((bar) => bar.lane);
    expect(rinderLanes).toEqual([1, 1]);
  });
});
