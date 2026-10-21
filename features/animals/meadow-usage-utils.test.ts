import { describe, test, expect } from "@jest/globals";
import type { MeadowUsageEntry } from "@/api/meadows.api";
import {
  getHerdsWithActiveSchedules,
  computeMeadowMonthlyUsage,
  getMeadowUsageYears,
} from "./meadow-usage-utils";

function makeStay(
  herdName: string,
  startDate: string,
  endDate: string,
  animalCountsByType: Record<string, number>,
): MeadowUsageEntry {
  return {
    meadowId: "m1",
    meadowName: "Allmend",
    meadowSize: 10000,
    herdId: `herd-${herdName}`,
    herdName,
    type: "pasture",
    startDate: `${startDate}T00:00:00.000Z`,
    endDate: `${endDate}T00:00:00.000Z`,
    animalCount: Object.values(animalCountsByType).reduce((a, b) => a + b, 0),
    animalCountsByType,
  };
}

const END_OF_YEAR = new Date(2025, 11, 31);

describe("computeMeadowMonthlyUsage", () => {
  test("counts days inclusive on both ends", () => {
    const usage = computeMeadowMonthlyUsage(
      [makeStay("A", "2025-05-01", "2025-05-15", { cow: 2 })],
      2025,
      END_OF_YEAR,
    );
    expect(usage.occupiedDays[4]).toBe(15);
    expect(usage.animalDaysByType.cow[4]).toBe(30);
  });

  test("splits animal-days per type for mixed herds", () => {
    // The example from the backend: a cow leaves, a sheep arrives on 16 May
    const usage = computeMeadowMonthlyUsage(
      [
        makeStay("A", "2025-05-01", "2025-05-15", { cow: 2 }),
        makeStay("A", "2025-05-16", "2025-05-31", { cow: 1, sheep: 1 }),
      ],
      2025,
      END_OF_YEAR,
    );
    expect(usage.occupiedDays[4]).toBe(31);
    expect(usage.animalDaysByType.cow[4]).toBe(15 * 2 + 16);
    expect(usage.animalDaysByType.sheep[4]).toBe(16);
  });

  test("two herds on the meadow at the same time count each day once", () => {
    const usage = computeMeadowMonthlyUsage(
      [
        makeStay("A", "2025-06-01", "2025-06-10", { cow: 3 }),
        makeStay("B", "2025-06-05", "2025-06-12", { sheep: 5 }),
      ],
      2025,
      END_OF_YEAR,
    );
    expect(usage.occupiedDays[5]).toBe(12);
  });

  test("a stay across months is split by month", () => {
    const usage = computeMeadowMonthlyUsage(
      [makeStay("A", "2025-04-25", "2025-05-05", { goat: 1 })],
      2025,
      END_OF_YEAR,
    );
    expect(usage.occupiedDays[3]).toBe(6);
    expect(usage.occupiedDays[4]).toBe(5);
  });

  test("only counts the selected year and days up to the until date", () => {
    const usage = computeMeadowMonthlyUsage(
      [makeStay("A", "2024-12-20", "2025-03-31", { cow: 1 })],
      2025,
      new Date(2025, 1, 10),
    );
    expect(usage.occupiedDays[0]).toBe(31);
    expect(usage.occupiedDays[1]).toBe(10);
    expect(usage.occupiedDays[2]).toBe(0);
  });

  test("reads the date part, not the local time", () => {
    // Midnight UTC is still 16 May, whatever the device timezone
    const usage = computeMeadowMonthlyUsage(
      [makeStay("A", "2025-05-16", "2025-05-16", { cow: 1 })],
      2025,
      END_OF_YEAR,
    );
    expect(usage.occupiedDays[4]).toBe(1);
  });
});

describe("getMeadowUsageYears", () => {
  test("from the first stay to the current year, newest first", () => {
    expect(
      getMeadowUsageYears(
        [makeStay("A", "2023-05-01", "2023-05-15", { cow: 1 })],
        2025,
      ),
    ).toEqual([2025, 2024, 2023]);
  });

  test("only the current year without stays", () => {
    expect(getMeadowUsageYears([], 2025)).toEqual([2025]);
  });
});

describe("getHerdsWithActiveSchedules", () => {
  const today = "2026-10-21";
  function herd(
    name: string,
    schedule: {
      meadowId?: string | null;
      endDate: string | null;
      until?: string | null;
    },
  ) {
    return {
      name,
      outdoorSchedules: [
        {
          meadowId: schedule.meadowId === undefined ? "m1" : schedule.meadowId,
          endDate: schedule.endDate,
          recurrence:
            schedule.until === undefined ? null : { until: schedule.until },
        },
      ],
    };
  }

  test("past single stay is not active", () => {
    expect(
      getHerdsWithActiveSchedules(
        [herd("A", { endDate: "2026-10-20" })],
        "m1",
        today,
      ),
    ).toEqual([]);
  });

  test("stay ending today, open-ended stay and other meadows", () => {
    expect(
      getHerdsWithActiveSchedules(
        [
          herd("A", { endDate: "2026-10-21T00:00:00.000Z" }),
          herd("B", { endDate: null }),
          herd("C", { endDate: null, meadowId: "m2" }),
        ],
        "m1",
        today,
      ),
    ).toEqual(["A", "B"]);
  });

  test("repeating schedule ends with its until date, not the first stay", () => {
    expect(
      getHerdsWithActiveSchedules(
        [
          herd("A", { endDate: "2025-05-01", until: null }),
          herd("B", { endDate: "2025-05-01", until: "2026-12-31" }),
          herd("C", { endDate: "2025-05-01", until: "2026-01-01" }),
        ],
        "m1",
        today,
      ),
    ).toEqual(["A", "B"]);
  });
});
