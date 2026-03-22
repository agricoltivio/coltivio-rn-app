import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import {
  buildOutdoorTimelineData,
  buildSingleHerdTimelineData,
} from "./outdoor-timeline-utils";
import type { OutdoorSchedule } from "@/api/herds.api";

// Pin clock to 2025-06-01 so epoch is deterministic:
// currentYear = 2025 → epochStart = 2022-01-01, years = [2022..2028], totalDays = 2557
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2025, 5, 1));
});

afterEach(() => {
  jest.useRealTimers();
});

const EPOCH_START = new Date(2022, 0, 1);
const MS_PER_DAY = 86_400_000;

/** Days from epoch start for a given date string (mirrors how source parses schedule dates) */
function dayOf(dateStr: string): number {
  return Math.floor(
    (new Date(dateStr).getTime() - EPOCH_START.getTime()) / MS_PER_DAY,
  );
}

let idCounter = 0;
function nextId(): string {
  return `test-${++idCounter}`;
}

type RecurrenceInput = {
  frequency: "weekly" | "monthly" | "yearly";
  interval?: number;
  byWeekday?: string[] | null;
  byMonthDay?: number | null;
  until?: string | null;
  count?: number | null;
};

function makeSchedule(
  startDate: string,
  endDate: string | null,
  opts?: {
    notes?: string | null;
    type?: "pasture" | "exercise_yard";
    recurrence?: RecurrenceInput;
  },
) {
  return {
    id: nextId(),
    startDate,
    endDate,
    notes: opts?.notes ?? null,
    type: opts?.type,
    recurrence: opts?.recurrence
      ? {
          frequency: opts.recurrence.frequency,
          interval: opts.recurrence.interval ?? 1,
          byWeekday: opts.recurrence.byWeekday ?? null,
          byMonthDay: opts.recurrence.byMonthDay ?? null,
          until: opts.recurrence.until ?? null,
          count: opts.recurrence.count ?? null,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// buildOutdoorTimelineData
// ---------------------------------------------------------------------------

describe("buildOutdoorTimelineData", () => {
  // --- Epoch structure ---

  test("returns correct years array and epochStart", () => {
    const result = buildOutdoorTimelineData([]);
    expect(result.years).toEqual([2022, 2023, 2024, 2025, 2026, 2027, 2028]);
    expect(result.epochStart).toEqual(new Date(2022, 0, 1));
  });

  test("totalDays spans 7 years including leap years 2024 and 2028", () => {
    const result = buildOutdoorTimelineData([]);
    // 365+365+366+365+365+365+366 = 2557
    expect(result.totalDays).toBe(2557);
  });

  test("empty herds returns empty herds array", () => {
    expect(buildOutdoorTimelineData([]).herds).toEqual([]);
  });

  test("herd with no schedules returns empty bars array", () => {
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [] },
    ]);
    expect(result.herds[0].bars).toHaveLength(0);
  });

  // --- Non-recurring ---

  test("non-recurring schedule creates a bar with correct startDay, endDay, isOpenEnded", () => {
    const schedule = makeSchedule("2025-05-01", "2025-05-31");
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    expect(result.herds[0].bars).toHaveLength(1);
    const bar = result.herds[0].bars[0];
    expect(bar.startDay).toBe(dayOf("2025-05-01"));
    expect(bar.endDay).toBe(dayOf("2025-05-31"));
    expect(bar.isOpenEnded).toBe(false);
  });

  test("open-ended schedule sets isOpenEnded=true and endDay at epoch boundary", () => {
    const schedule = makeSchedule("2025-05-01", null);
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    const bar = result.herds[0].bars[0];
    expect(bar.isOpenEnded).toBe(true);
    // epochEnd = 2028-12-31 23:59:59.999
    const epochEnd = new Date(2028, 11, 31, 23, 59, 59, 999);
    const expectedEndDay = Math.floor(
      (epochEnd.getTime() - EPOCH_START.getTime()) / MS_PER_DAY,
    );
    expect(bar.endDay).toBe(expectedEndDay);
  });

  test("schedule before epoch is excluded", () => {
    const result = buildOutdoorTimelineData([
      {
        herdId: "h1",
        herdName: "Herd 1",
        schedules: [makeSchedule("2019-01-01", "2021-12-31")],
      },
    ]);
    expect(result.herds[0].bars).toHaveLength(0);
  });

  test("schedule after epoch is excluded", () => {
    const result = buildOutdoorTimelineData([
      {
        herdId: "h1",
        herdName: "Herd 1",
        schedules: [makeSchedule("2030-01-01", "2030-12-31")],
      },
    ]);
    expect(result.herds[0].bars).toHaveLength(0);
  });

  test("schedule partially before epoch is clamped to epochStart", () => {
    const schedule = makeSchedule("2021-06-01", "2022-06-01");
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    const bar = result.herds[0].bars[0];
    expect(bar.startDay).toBe(0); // clamped to day 0 (2022-01-01)
    expect(bar.endDay).toBe(dayOf("2022-06-01"));
  });

  // --- Bar metadata ---

  test("bar contains correct scheduleId, herdId, herdName, notes, scheduleType", () => {
    const schedule = makeSchedule("2025-05-01", "2025-05-31", {
      notes: "Summer pasture",
      type: "pasture",
    });
    schedule.id = "sched-123";
    const result = buildOutdoorTimelineData([
      { herdId: "herd-1", herdName: "My Herd", schedules: [schedule] },
    ]);
    const bar = result.herds[0].bars[0];
    expect(bar.scheduleId).toBe("sched-123");
    expect(bar.herdId).toBe("herd-1");
    expect(bar.herdName).toBe("My Herd");
    expect(bar.notes).toBe("Summer pasture");
    expect(bar.scheduleType).toBe("pasture");
  });

  // --- Recurring: yearly ---

  test("yearly recurrence generates one bar per year within epoch", () => {
    const schedule = makeSchedule("2022-06-01", "2022-08-31", {
      recurrence: { frequency: "yearly" },
    });
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    // Epoch 2022-2028 → 7 years
    expect(result.herds[0].bars).toHaveLength(7);
    expect(result.herds[0].bars[0].startDay).toBe(dayOf("2022-06-01"));
    expect(result.herds[0].bars[1].startDay).toBe(dayOf("2023-06-01"));
  });

  test("yearly recurrence with until stops at correct year", () => {
    const schedule = makeSchedule("2022-06-01", "2022-08-31", {
      recurrence: { frequency: "yearly", until: "2024-12-31" },
    });
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    expect(result.herds[0].bars).toHaveLength(3); // 2022, 2023, 2024
  });

  test("yearly recurrence with count stops after N occurrences", () => {
    const schedule = makeSchedule("2022-06-01", "2022-08-31", {
      recurrence: { frequency: "yearly", count: 2 },
    });
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    expect(result.herds[0].bars).toHaveLength(2);
  });

  // --- Recurring: monthly ---

  test("monthly recurrence generates one bar per month", () => {
    const schedule = makeSchedule("2025-01-15", "2025-01-17", {
      recurrence: { frequency: "monthly", until: "2025-04-30" },
    });
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    expect(result.herds[0].bars).toHaveLength(4); // Jan, Feb, Mar, Apr
    expect(result.herds[0].bars[0].startDay).toBe(dayOf("2025-01-15"));
    expect(result.herds[0].bars[1].startDay).toBe(dayOf("2025-02-15"));
  });

  test("monthly recurrence with byMonthDay overrides start day of month", () => {
    const schedule = makeSchedule("2025-01-15", "2025-01-15", {
      recurrence: { frequency: "monthly", byMonthDay: 1, until: "2025-03-31" },
    });
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    expect(result.herds[0].bars).toHaveLength(3);
    expect(result.herds[0].bars[0].startDay).toBe(dayOf("2025-01-01"));
    expect(result.herds[0].bars[1].startDay).toBe(dayOf("2025-02-01"));
    expect(result.herds[0].bars[2].startDay).toBe(dayOf("2025-03-01"));
  });

  test("monthly recurrence with interval 2 generates every other month", () => {
    const schedule = makeSchedule("2025-01-10", "2025-01-10", {
      recurrence: { frequency: "monthly", interval: 2, until: "2025-06-30" },
    });
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    // Jan, Mar, May
    expect(result.herds[0].bars).toHaveLength(3);
  });

  // --- Recurring: weekly ---

  test("weekly recurrence without byWeekday generates one bar per week on the original weekday", () => {
    // 2025-01-06 is a Monday
    const schedule = makeSchedule("2025-01-06", "2025-01-06", {
      recurrence: { frequency: "weekly", until: "2025-01-27" },
    });
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    // Mondays: Jan 6, 13, 20, 27
    expect(result.herds[0].bars).toHaveLength(4);
    expect(result.herds[0].bars[0].startDay).toBe(dayOf("2025-01-06"));
    expect(result.herds[0].bars[1].startDay).toBe(dayOf("2025-01-13"));
    expect(result.herds[0].bars[2].startDay).toBe(dayOf("2025-01-20"));
    expect(result.herds[0].bars[3].startDay).toBe(dayOf("2025-01-27"));
  });

  test("weekly recurrence with byWeekday generates one bar per specified day per week", () => {
    // 2025-01-06 is a Monday; request MO and WE
    const schedule = makeSchedule("2025-01-06", "2025-01-06", {
      recurrence: {
        frequency: "weekly",
        byWeekday: ["MO", "WE"],
        until: "2025-01-19",
      },
    });
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    // Week 1: MO=Jan 6, WE=Jan 8; Week 2: MO=Jan 13, WE=Jan 15
    expect(result.herds[0].bars).toHaveLength(4);
    expect(result.herds[0].bars[0].startDay).toBe(dayOf("2025-01-06"));
    expect(result.herds[0].bars[1].startDay).toBe(dayOf("2025-01-08"));
    expect(result.herds[0].bars[2].startDay).toBe(dayOf("2025-01-13"));
    expect(result.herds[0].bars[3].startDay).toBe(dayOf("2025-01-15"));
  });

  test("weekly recurrence with interval 2 generates every other week", () => {
    const schedule = makeSchedule("2025-01-06", "2025-01-06", {
      recurrence: { frequency: "weekly", interval: 2, until: "2025-02-28" },
    });
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules: [schedule] },
    ]);
    // Jan 6, Jan 20, Feb 3, Feb 17
    expect(result.herds[0].bars).toHaveLength(4);
    expect(result.herds[0].bars[0].startDay).toBe(dayOf("2025-01-06"));
    expect(result.herds[0].bars[1].startDay).toBe(dayOf("2025-01-20"));
    expect(result.herds[0].bars[2].startDay).toBe(dayOf("2025-02-03"));
    expect(result.herds[0].bars[3].startDay).toBe(dayOf("2025-02-17"));
  });

  // --- Sorting ---

  test("bars within a herd are sorted by startDay", () => {
    const schedules = [
      makeSchedule("2025-06-01", "2025-06-30"),
      makeSchedule("2025-03-01", "2025-03-31"),
    ];
    const result = buildOutdoorTimelineData([
      { herdId: "h1", herdName: "Herd 1", schedules },
    ]);
    const bars = result.herds[0].bars;
    expect(bars[0].startDay).toBe(dayOf("2025-03-01"));
    expect(bars[1].startDay).toBe(dayOf("2025-06-01"));
  });

  // --- Multiple herds ---

  test("multiple herds produce independent herd rows with correct metadata", () => {
    const result = buildOutdoorTimelineData([
      {
        herdId: "h1",
        herdName: "Herd 1",
        schedules: [makeSchedule("2025-05-01", "2025-05-31")],
      },
      {
        herdId: "h2",
        herdName: "Herd 2",
        schedules: [makeSchedule("2025-06-01", "2025-06-30")],
      },
    ]);
    expect(result.herds).toHaveLength(2);
    expect(result.herds[0].herdId).toBe("h1");
    expect(result.herds[0].herdName).toBe("Herd 1");
    expect(result.herds[1].herdId).toBe("h2");
    expect(result.herds[0].bars).toHaveLength(1);
    expect(result.herds[1].bars).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// buildSingleHerdTimelineData
// ---------------------------------------------------------------------------

describe("buildSingleHerdTimelineData", () => {
  test("wraps a single herd and delegates to buildOutdoorTimelineData", () => {
    const schedule: OutdoorSchedule = {
      id: "s1",
      farmId: "farm-1",
      herdId: "h1",
      startDate: "2025-05-01T00:00:00.000Z",
      endDate: "2025-05-31T00:00:00.000Z",
      notes: "test",
      type: "pasture",
      recurrence: null,
    };
    const result = buildSingleHerdTimelineData("h1", "My Herd", [schedule]);
    expect(result.herds).toHaveLength(1);
    expect(result.herds[0].herdId).toBe("h1");
    expect(result.herds[0].herdName).toBe("My Herd");
    expect(result.herds[0].bars).toHaveLength(1);
    expect(result.herds[0].bars[0].scheduleId).toBe("s1");
    expect(result.herds[0].bars[0].scheduleType).toBe("pasture");
    expect(result.herds[0].bars[0].notes).toBe("test");
  });

  test("maps recurrence fields through correctly", () => {
    const schedule: OutdoorSchedule = {
      id: "s2",
      farmId: "farm-1",
      herdId: "h1",
      startDate: "2022-06-01T00:00:00.000Z",
      endDate: "2022-08-31T00:00:00.000Z",
      notes: null,
      type: "exercise_yard",
      recurrence: {
        id: "r1",
        frequency: "yearly",
        interval: 1,
        byWeekday: null,
        byMonthDay: null,
        until: "2024-12-31",
        count: null,
      },
    };
    const result = buildSingleHerdTimelineData("h1", "My Herd", [schedule]);
    // Yearly from 2022 until end of 2024 → 3 bars (2022, 2023, 2024)
    expect(result.herds[0].bars).toHaveLength(3);
  });
});
