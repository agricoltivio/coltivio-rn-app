import { describe, test, expect } from "@jest/globals";
import {
  getDayOfYear,
  dayRangesOverlap,
  getOccurrenceYears,
  hasRotationOverlap,
} from "./plan-crop-rotations-conflict-utils";
import type { RotationEntry } from "./plan-crop-rotations.store";

// Wide range so tests don't hit boundary artifacts
const RANGE_START = 2015;
const RANGE_END = 2050;

let idCounter = 0;
function nextId(): string {
  return `test-${++idCounter}`;
}

function d(dateStr: string): Date {
  return new Date(dateStr);
}

function makeRotation(
  fromDate: Date,
  toDate: Date,
  recurrence?: { interval: number; until?: Date },
): RotationEntry {
  return {
    entryId: nextId(),
    cropId: "crop-1",
    fromDate,
    toDate,
    recurrence,
  };
}

// ---------------------------------------------------------------------------
// getDayOfYear
// ---------------------------------------------------------------------------

describe("getDayOfYear", () => {
  test("Jan 1 is day 1", () => {
    expect(getDayOfYear(new Date(2025, 0, 1))).toBe(1);
  });

  test("Dec 31 non-leap year is day 365", () => {
    expect(getDayOfYear(new Date(2025, 11, 31))).toBe(365);
  });

  test("Dec 31 leap year (2024) is day 366", () => {
    expect(getDayOfYear(new Date(2024, 11, 31))).toBe(366);
  });

  test("Feb 28 is day 59 in a non-leap year", () => {
    expect(getDayOfYear(new Date(2025, 1, 28))).toBe(59);
  });
});

// ---------------------------------------------------------------------------
// dayRangesOverlap
// ---------------------------------------------------------------------------

describe("dayRangesOverlap", () => {
  test("clear overlap: May–Aug vs Jul–Sep", () => {
    const may1 = getDayOfYear(new Date(2025, 4, 1));
    const aug31 = getDayOfYear(new Date(2025, 7, 31));
    const jul1 = getDayOfYear(new Date(2025, 6, 1));
    const sep30 = getDayOfYear(new Date(2025, 8, 30));
    expect(dayRangesOverlap(may1, aug31, jul1, sep30)).toBe(true);
  });

  test("adjacent months do not overlap: May–Jun vs Jul–Sep", () => {
    const may1 = getDayOfYear(new Date(2025, 4, 1));
    const jun30 = getDayOfYear(new Date(2025, 5, 30));
    const jul1 = getDayOfYear(new Date(2025, 6, 1));
    const sep30 = getDayOfYear(new Date(2025, 8, 30));
    expect(dayRangesOverlap(may1, jun30, jul1, sep30)).toBe(false);
  });

  test("year-crossing range (Nov–Mar) overlaps Jan–Feb", () => {
    const nov1 = getDayOfYear(new Date(2025, 10, 1));
    const mar31 = getDayOfYear(new Date(2025, 2, 31)); // next year's Mar 31 has same day-of-year
    const jan1 = getDayOfYear(new Date(2025, 0, 1));
    const feb28 = getDayOfYear(new Date(2025, 1, 28));
    // Nov–Mar crosses year boundary (nov1 > mar31 in day-of-year)
    expect(dayRangesOverlap(nov1, mar31, jan1, feb28)).toBe(true);
  });

  test("year-crossing range (Nov–Mar) does NOT overlap Apr–Oct", () => {
    const nov1 = getDayOfYear(new Date(2025, 10, 1));
    const mar31 = getDayOfYear(new Date(2025, 2, 31));
    const apr1 = getDayOfYear(new Date(2025, 3, 1));
    const oct31 = getDayOfYear(new Date(2025, 9, 31));
    expect(dayRangesOverlap(nov1, mar31, apr1, oct31)).toBe(false);
  });

  test("adjacent year-crossing ranges: Nov–Dec vs Jan–Mar", () => {
    const nov1 = getDayOfYear(new Date(2025, 10, 1));
    const dec31 = getDayOfYear(new Date(2025, 11, 31));
    const jan1 = getDayOfYear(new Date(2025, 0, 1));
    const mar31 = getDayOfYear(new Date(2025, 2, 31));
    expect(dayRangesOverlap(nov1, dec31, jan1, mar31)).toBe(false);
  });

  test("identical single-day windows overlap", () => {
    const jun15 = getDayOfYear(new Date(2025, 5, 15));
    expect(dayRangesOverlap(jun15, jun15, jun15, jun15)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getOccurrenceYears
// ---------------------------------------------------------------------------

describe("getOccurrenceYears", () => {
  test("annual from 2022: returns all years up to rangeEnd", () => {
    const years = getOccurrenceYears(2022, 1, null, 2022, 2025, 0);
    expect([...years].sort()).toEqual([2022, 2023, 2024, 2025]);
  });

  test("biennial from 2022: returns every other year", () => {
    const years = getOccurrenceYears(2022, 2, null, 2022, 2028, 0);
    expect([...years].sort()).toEqual([2022, 2024, 2026, 2028]);
  });

  test("respects untilYear", () => {
    const years = getOccurrenceYears(2022, 1, 2024, 2022, 2028, 0);
    expect([...years].sort()).toEqual([2022, 2023, 2024]);
  });

  test("year-crossing (yearSpan=1): annual Nov–Mar adds N and N+1", () => {
    const years = getOccurrenceYears(2022, 1, null, 2022, 2024, 1);
    expect([...years].sort()).toEqual([2022, 2023, 2024, 2025]);
  });

  test("filters years below rangeStart", () => {
    const years = getOccurrenceYears(2018, 1, null, 2022, 2024, 0);
    expect([...years].sort()).toEqual([2022, 2023, 2024]);
  });
});

// ---------------------------------------------------------------------------
// hasRotationOverlap
// ---------------------------------------------------------------------------

describe("hasRotationOverlap", () => {
  // ---------------------------------------------------------------------------
  // Non-recurring
  // ---------------------------------------------------------------------------

  test("non-recurring: clear overlap (May–Aug vs Jul–Sep same year)", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-05-01"), d("2025-08-31")),
        makeRotation(d("2025-07-01"), d("2025-09-30")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  test("non-recurring: adjacent months do not overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-05-01"), d("2025-06-30")),
        makeRotation(d("2025-07-01"), d("2025-09-30")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  test("non-recurring: year-crossing range overlaps a range in the second year", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-11-01"), d("2026-03-31")),
        makeRotation(d("2026-02-01"), d("2026-04-30")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  test("non-recurring: adjacent year-crossing ranges do not overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-11-01"), d("2025-12-31")),
        makeRotation(d("2026-01-01"), d("2026-03-31")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  test("non-recurring: same single day overlaps itself", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-06-15"), d("2025-06-15")),
        makeRotation(d("2025-06-15"), d("2025-06-15")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  test("non-recurring: multi-year ranges overlap when years intersect", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2024-01-01"), d("2025-12-31")),
        makeRotation(d("2025-06-01"), d("2027-05-31")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  test("non-recurring: multi-year ranges in separate years do not overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2022-01-01"), d("2023-12-31")),
        makeRotation(d("2025-01-01"), d("2026-12-31")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Recurring (both)
  // ---------------------------------------------------------------------------

  test("recurring: both annual, overlapping day windows → overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-05-01"), d("2025-08-31"), { interval: 1 }),
        makeRotation(d("2025-07-01"), d("2025-09-30"), { interval: 1 }),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  test("recurring: both annual, non-overlapping day windows → no overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-05-01"), d("2025-08-31"), { interval: 1 }),
        makeRotation(d("2025-09-01"), d("2025-11-30"), { interval: 1 }),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  test("recurring: year-crossing annual (Nov–Mar) overlaps annual Jan–Feb", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-11-01"), d("2026-03-31"), { interval: 1 }),
        makeRotation(d("2026-01-01"), d("2026-02-28"), { interval: 1 }),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  test("recurring: year-crossing annual (Nov–Mar) does NOT overlap annual Apr–Oct", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-11-01"), d("2026-03-31"), { interval: 1 }),
        makeRotation(d("2025-04-01"), d("2025-10-31"), { interval: 1 }),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  test("recurring: annual Nov–Dec does NOT overlap annual Jan–Feb", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-11-01"), d("2025-12-31"), { interval: 1 }),
        makeRotation(d("2026-01-01"), d("2026-02-28"), { interval: 1 }),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  test("recurring: biennial alternating years → no overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-06-01"), d("2025-08-31"), { interval: 2 }),
        makeRotation(d("2026-06-01"), d("2026-08-31"), { interval: 2 }),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  test("recurring: biennial same start year, overlapping day windows → overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-06-01"), d("2025-07-31"), { interval: 2 }),
        makeRotation(d("2025-07-01"), d("2025-08-31"), { interval: 2 }),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  test("recurring: annual with until before second rotation's start year → no overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2020-06-01"), d("2020-08-31"), {
          interval: 1,
          until: d("2022-12-31"),
        }),
        makeRotation(d("2025-06-01"), d("2025-08-31"), { interval: 1 }),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  test("recurring: both with until, overlapping years → overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2023-05-01"), d("2023-07-31"), {
          interval: 1,
          until: d("2026-12-31"),
        }),
        makeRotation(d("2025-06-01"), d("2025-08-31"), {
          interval: 1,
          until: d("2027-12-31"),
        }),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Mixed: one recurring, one non-recurring
  // ---------------------------------------------------------------------------

  test("mixed: annual May–Aug vs one-time May 2025 → overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2024-05-01"), d("2024-08-31"), { interval: 1 }),
        makeRotation(d("2025-05-15"), d("2025-07-15")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  test("mixed: annual May–Aug starting 2027 vs one-time May 2025 → no overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2027-05-01"), d("2027-08-31"), { interval: 1 }),
        makeRotation(d("2025-05-15"), d("2025-07-15")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  test("mixed: year-crossing annual (Nov–Mar) vs one-time Feb in shared year → overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2025-11-01"), d("2026-03-31"), { interval: 1 }),
        makeRotation(d("2026-02-01"), d("2026-02-28")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  test("mixed: year-crossing biennial (Nov–Mar) vs one-time Jan in spanned year → overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2022-11-15"), d("2023-03-15"), { interval: 2 }),
        makeRotation(d("2023-01-10"), d("2023-02-28")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  test("mixed: year-crossing biennial vs one-time before first occurrence → no overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2022-11-15"), d("2023-03-15"), { interval: 2 }),
        makeRotation(d("2021-01-10"), d("2021-02-28")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  test("mixed: annual expired by until vs one-time after until year → no overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2020-06-01"), d("2020-08-31"), {
          interval: 1,
          until: d("2022-12-31"),
        }),
        makeRotation(d("2025-07-01"), d("2025-07-31")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(false);
  });

  test("mixed: annual expired by until vs one-time within active years → overlap", () => {
    expect(
      hasRotationOverlap(
        makeRotation(d("2020-06-01"), d("2020-08-31"), {
          interval: 1,
          until: d("2025-12-31"),
        }),
        makeRotation(d("2025-07-01"), d("2025-07-31")),
        RANGE_START,
        RANGE_END,
      ),
    ).toBe(true);
  });

  // Regression: three sequential year-spanning rotations every 3 years were
  // falsely flagged as overlapping because day-of-year arithmetic treated
  // their shared [1,31] (January) sub-ranges as colliding even though they
  // belonged to different calendar years.
  test("regression: three sequential year-spanning rotations every 3 years → no overlap", () => {
    const r1 = makeRotation(d("2026-12-01"), d("2027-01-31"), { interval: 3 }); // Dec–Jan
    const r2 = makeRotation(d("2027-02-01"), d("2027-08-01"), { interval: 3 }); // Feb–Aug
    const r3 = makeRotation(d("2027-08-02"), d("2028-01-31"), { interval: 3 }); // Aug–Jan

    expect(hasRotationOverlap(r1, r2, RANGE_START, RANGE_END)).toBe(false);
    expect(hasRotationOverlap(r1, r3, RANGE_START, RANGE_END)).toBe(false);
    expect(hasRotationOverlap(r2, r3, RANGE_START, RANGE_END)).toBe(false);
  });
});
