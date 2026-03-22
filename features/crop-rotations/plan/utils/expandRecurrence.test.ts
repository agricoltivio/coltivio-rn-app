import { describe, test, expect } from "@jest/globals";
import { expandRecurrence, expandAllRecurrences } from "./expandRecurrence";
import type { PlotCropRotation } from "@/api/crop-rotations.api";

const DEFAULT_CROP: PlotCropRotation["crop"] = {
  id: "crop-1",
  farmId: "farm-1",
  name: "Wheat",
  category: "grain",
  familyId: null,
  variety: null,
  usageCodes: [],
  waitingTimeInYears: null,
  additionalNotes: null,
  family: null,
};

function makeRotation(
  fromDate: string,
  toDate: string,
  recurrence?: { interval: number; until?: string | null },
): PlotCropRotation {
  return {
    id: "rot-1",
    farmId: "farm-1",
    plotId: "plot-1",
    cropId: "crop-1",
    sowingDate: null,
    fromDate,
    toDate,
    crop: DEFAULT_CROP,
    recurrence: recurrence
      ? { id: "rec-1", interval: recurrence.interval, until: recurrence.until ?? null }
      : null,
  };
}

describe("expandRecurrence", () => {
  const queryFrom = new Date("2024-01-01T00:00:00Z");
  const queryTo = new Date("2026-12-31T23:59:59Z");

  // --- No recurrence ---

  test("no recurrence, rotation within range → returns [rotation]", () => {
    const rotation = makeRotation("2025-03-01T00:00:00Z", "2025-05-31T00:00:00Z");
    const result = expandRecurrence(rotation, queryFrom, queryTo);
    expect(result).toHaveLength(1);
    expect(result[0].fromDate).toBe("2025-03-01T00:00:00Z");
    expect(result[0].toDate).toBe("2025-05-31T00:00:00Z");
  });

  test("no recurrence, entirely outside range → returns []", () => {
    const rotation = makeRotation("2020-01-01T00:00:00Z", "2020-12-31T00:00:00Z");
    const result = expandRecurrence(rotation, queryFrom, queryTo);
    expect(result).toHaveLength(0);
  });

  test("no recurrence, rotation spans entire query range → returns [rotation]", () => {
    const rotation = makeRotation("2023-01-01T00:00:00Z", "2027-12-31T00:00:00Z");
    const result = expandRecurrence(rotation, queryFrom, queryTo);
    expect(result).toHaveLength(1);
  });

  test("no recurrence, rotation end inside range → included", () => {
    const rotation = makeRotation("2023-06-01T00:00:00Z", "2024-06-01T00:00:00Z");
    const result = expandRecurrence(rotation, queryFrom, queryTo);
    expect(result).toHaveLength(1);
  });

  // --- Yearly interval=1 ---

  test("yearly interval=1: expands each year's occurrence within range", () => {
    const rotation = makeRotation(
      "2022-05-01T00:00:00Z",
      "2022-07-31T00:00:00Z",
      { interval: 1 },
    );
    const result = expandRecurrence(rotation, queryFrom, queryTo);
    // 2022 is before range, 2024, 2025, 2026 are in range, 2027 might be
    const fromDates = result.map((r) => r.fromDate);
    expect(fromDates).toContain("2024-05-01T00:00:00.000Z");
    expect(fromDates).toContain("2025-05-01T00:00:00.000Z");
    expect(fromDates).toContain("2026-05-01T00:00:00.000Z");
    // 2022/2023 occurrences are outside range
    expect(fromDates.some((d) => d.startsWith("2022"))).toBe(false);
    expect(fromDates.some((d) => d.startsWith("2023"))).toBe(false);
  });

  test("yearly interval=1: result entries have shifted fromDate/toDate", () => {
    const rotation = makeRotation(
      "2024-06-01T00:00:00Z",
      "2024-08-31T00:00:00Z",
      { interval: 1 },
    );
    const result = expandRecurrence(rotation, queryFrom, queryTo);
    // First occurrence: 2024, second: 2025, third: 2026
    expect(result).toHaveLength(3);
    expect(result[0].fromDate).toBe("2024-06-01T00:00:00.000Z");
    expect(result[1].fromDate).toBe("2025-06-01T00:00:00.000Z");
    expect(result[2].fromDate).toBe("2026-06-01T00:00:00.000Z");
  });

  // --- Yearly interval=2 ---

  test("yearly interval=2: only every-other-year occurrences", () => {
    const rotation = makeRotation(
      "2024-03-01T00:00:00Z",
      "2024-05-31T00:00:00Z",
      { interval: 2 },
    );
    const result = expandRecurrence(rotation, queryFrom, queryTo);
    const fromDates = result.map((r) => r.fromDate);
    // 2024 and 2026 match; 2025 does not
    expect(fromDates.some((d) => d.startsWith("2024"))).toBe(true);
    expect(fromDates.some((d) => d.startsWith("2026"))).toBe(true);
    expect(fromDates.some((d) => d.startsWith("2025"))).toBe(false);
  });

  // --- Yearly with until ---

  test("yearly with until: stops at until date", () => {
    const rotation = makeRotation(
      "2024-01-01T00:00:00Z",
      "2024-03-31T00:00:00Z",
      { interval: 1, until: "2025-01-02T00:00:00Z" },
    );
    const result = expandRecurrence(rotation, queryFrom, queryTo);
    const years = result.map((r) => new Date(r.fromDate).getUTCFullYear());
    expect(years).toContain(2024);
    expect(years).toContain(2025);
    expect(years).not.toContain(2026);
  });

  // --- Safety: 1000-iteration guard ---

  test("open-ended recurrence with interval=1 does not loop forever", () => {
    const rotation = makeRotation(
      "2000-01-01T00:00:00Z",
      "2000-03-31T00:00:00Z",
      { interval: 1 },
    );
    const wideQuery = new Date("2000-01-01T00:00:00Z");
    const wideQueryTo = new Date("3000-01-01T00:00:00Z");
    // Should terminate due to 1000-iteration guard
    expect(() =>
      expandRecurrence(rotation, wideQuery, wideQueryTo),
    ).not.toThrow();
    const result = expandRecurrence(rotation, wideQuery, wideQueryTo);
    expect(result.length).toBeLessThanOrEqual(1001);
  });
});

describe("expandAllRecurrences", () => {
  const queryFrom = new Date("2025-01-01T00:00:00Z");
  const queryTo = new Date("2025-12-31T23:59:59Z");

  test("mix of recurring and non-recurring → flat result", () => {
    const nonRecurring = makeRotation(
      "2025-03-01T00:00:00Z",
      "2025-05-31T00:00:00Z",
    );
    nonRecurring.id = "rot-nr";

    const recurring = makeRotation(
      "2024-06-01T00:00:00Z",
      "2024-08-31T00:00:00Z",
      { interval: 1 },
    );
    recurring.id = "rot-r";

    const result = expandAllRecurrences([nonRecurring, recurring], queryFrom, queryTo);
    // nonRecurring: 1 occurrence; recurring: 1 occurrence in 2025
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.some((r) => r.id === "rot-nr")).toBe(true);
    expect(result.some((r) => r.id === "rot-r")).toBe(true);
  });

  test("empty input → empty result", () => {
    expect(expandAllRecurrences([], queryFrom, queryTo)).toEqual([]);
  });

  test("rotation entirely outside range → excluded from result", () => {
    const outside = makeRotation("2020-01-01T00:00:00Z", "2020-12-31T00:00:00Z");
    expect(expandAllRecurrences([outside], queryFrom, queryTo)).toHaveLength(0);
  });
});
