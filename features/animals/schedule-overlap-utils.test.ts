import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { hasScheduleOverlaps } from "./schedule-overlap-utils";
import type { OutdoorScheduleCreateInput } from "@/api/herds.api";

// Pin clock so defaultEnd (currentYear + 25) is deterministic
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2025, 0, 1));
});

afterEach(() => {
  jest.useRealTimers();
});

function makeSchedule(
  startDate: string,
  endDate: string | null | undefined,
  recurrence?: OutdoorScheduleCreateInput["recurrence"],
): OutdoorScheduleCreateInput {
  return {
    startDate,
    endDate: endDate ?? null,
    type: "pasture",
    recurrence: recurrence ?? null,
  };
}

describe("hasScheduleOverlaps", () => {
  test("single schedule → false", () => {
    expect(
      hasScheduleOverlaps([makeSchedule("2025-01-01", "2025-03-31")]),
    ).toBe(false);
  });

  // --- Non-recurring ---

  test("non-recurring: clear overlap", () => {
    const a = makeSchedule("2025-01-01", "2025-06-30");
    const b = makeSchedule("2025-03-01", "2025-09-30");
    expect(hasScheduleOverlaps([a, b])).toBe(true);
  });

  test("non-recurring: adjacent dates do not overlap", () => {
    const a = makeSchedule("2025-01-01", "2025-06-30");
    const b = makeSchedule("2025-07-01", "2025-12-31");
    expect(hasScheduleOverlaps([a, b])).toBe(false);
  });

  test("non-recurring: year-crossing overlap", () => {
    const a = makeSchedule("2025-10-01", "2026-02-28");
    const b = makeSchedule("2026-01-01", "2026-06-30");
    expect(hasScheduleOverlaps([a, b])).toBe(true);
  });

  test("non-recurring: adjacent year-crossing no overlap", () => {
    const a = makeSchedule("2025-10-01", "2025-12-31");
    const b = makeSchedule("2026-01-01", "2026-03-31");
    expect(hasScheduleOverlaps([a, b])).toBe(false);
  });

  test("non-recurring: identical single-day schedules overlap", () => {
    const a = makeSchedule("2025-06-15", "2025-06-15");
    const b = makeSchedule("2025-06-15", "2025-06-15");
    expect(hasScheduleOverlaps([a, b])).toBe(true);
  });

  // --- Recurring yearly ---

  test("yearly: overlapping windows", () => {
    const a = makeSchedule("2025-05-01", "2025-07-31", {
      frequency: "yearly",
      interval: 1,
    });
    const b = makeSchedule("2025-06-01", "2025-08-31", {
      frequency: "yearly",
      interval: 1,
    });
    expect(hasScheduleOverlaps([a, b])).toBe(true);
  });

  test("yearly: non-overlapping windows", () => {
    const a = makeSchedule("2025-01-01", "2025-04-30", {
      frequency: "yearly",
      interval: 1,
    });
    const b = makeSchedule("2025-07-01", "2025-09-30", {
      frequency: "yearly",
      interval: 1,
    });
    expect(hasScheduleOverlaps([a, b])).toBe(false);
  });

  test("yearly: with until stops before overlap", () => {
    // a only recurs through 2025; b starts 2026 — no overlap
    const a = makeSchedule("2024-06-01", "2024-08-31", {
      frequency: "yearly",
      interval: 1,
      until: "2025-01-01",
    });
    const b = makeSchedule("2026-06-01", "2026-08-31", {
      frequency: "yearly",
      interval: 1,
    });
    expect(hasScheduleOverlaps([a, b])).toBe(false);
  });

  test("yearly: biennial alternating years (interval=2) — no overlap", () => {
    // a starts 2025 (odd), b starts 2026 (even), each every 2 years
    const a = makeSchedule("2025-06-01", "2025-08-31", {
      frequency: "yearly",
      interval: 2,
    });
    const b = makeSchedule("2026-06-01", "2026-08-31", {
      frequency: "yearly",
      interval: 2,
    });
    expect(hasScheduleOverlaps([a, b])).toBe(false);
  });

  test("yearly: biennial same start year (interval=2) — overlap on shared years", () => {
    const a = makeSchedule("2025-06-01", "2025-07-31", {
      frequency: "yearly",
      interval: 2,
    });
    const b = makeSchedule("2025-06-15", "2025-09-30", {
      frequency: "yearly",
      interval: 2,
    });
    expect(hasScheduleOverlaps([a, b])).toBe(true);
  });

  test("yearly: year-crossing (Nov–Mar) vs Jan–Feb — overlap", () => {
    const a = makeSchedule("2024-11-01", "2025-03-31", {
      frequency: "yearly",
      interval: 1,
    });
    const b = makeSchedule("2025-01-01", "2025-02-28");
    expect(hasScheduleOverlaps([a, b])).toBe(true);
  });

  // --- Recurring monthly ---

  test("monthly: overlapping same month", () => {
    const a = makeSchedule("2025-01-10", "2025-01-20", {
      frequency: "monthly",
      interval: 1,
    });
    const b = makeSchedule("2025-01-15", "2025-01-25", {
      frequency: "monthly",
      interval: 1,
    });
    expect(hasScheduleOverlaps([a, b])).toBe(true);
  });

  test("monthly: non-overlapping months", () => {
    // a: 1st–5th of each month; b: 20th–25th of each month — no overlap
    const a = makeSchedule("2025-01-01", "2025-01-05", {
      frequency: "monthly",
      interval: 1,
    });
    const b = makeSchedule("2025-01-20", "2025-01-25", {
      frequency: "monthly",
      interval: 1,
    });
    expect(hasScheduleOverlaps([a, b])).toBe(false);
  });

  // --- Recurring weekly ---

  test("weekly: overlapping weekdays", () => {
    // Mon–Wed vs Tue–Thu every week → overlap
    const a = makeSchedule("2025-01-06", "2025-01-08", {
      frequency: "weekly",
      interval: 1,
    });
    const b = makeSchedule("2025-01-07", "2025-01-09", {
      frequency: "weekly",
      interval: 1,
    });
    expect(hasScheduleOverlaps([a, b])).toBe(true);
  });

  test("weekly: non-overlapping weekdays", () => {
    // Mon only vs Wed only every week — no overlap
    const a = makeSchedule("2025-01-06", "2025-01-06", {
      frequency: "weekly",
      interval: 1,
    });
    const b = makeSchedule("2025-01-08", "2025-01-08", {
      frequency: "weekly",
      interval: 1,
    });
    expect(hasScheduleOverlaps([a, b])).toBe(false);
  });

  // --- Mixed ---

  test("mixed (yearly + non-recurring): overlap", () => {
    const a = makeSchedule("2025-05-01", "2025-07-31", {
      frequency: "yearly",
      interval: 1,
    });
    const b = makeSchedule("2025-06-01", "2025-06-15");
    expect(hasScheduleOverlaps([a, b])).toBe(true);
  });

  test("mixed (yearly + non-recurring): no overlap", () => {
    const a = makeSchedule("2025-01-01", "2025-03-31", {
      frequency: "yearly",
      interval: 1,
    });
    const b = makeSchedule("2026-07-01", "2026-09-30");
    expect(hasScheduleOverlaps([a, b])).toBe(false);
  });

  // --- Three schedules ---

  test("three schedules: third overlaps second but not first", () => {
    const a = makeSchedule("2025-01-01", "2025-03-31");
    const b = makeSchedule("2025-07-01", "2025-09-30");
    const c = makeSchedule("2025-08-01", "2025-10-31"); // overlaps b
    expect(hasScheduleOverlaps([a, b, c])).toBe(true);
  });

  test("three schedules: no pair overlaps", () => {
    const a = makeSchedule("2025-01-01", "2025-03-31");
    const b = makeSchedule("2025-05-01", "2025-07-31");
    const c = makeSchedule("2025-09-01", "2025-11-30");
    expect(hasScheduleOverlaps([a, b, c])).toBe(false);
  });
});
