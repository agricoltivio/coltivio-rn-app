import { describe, test, expect } from "@jest/globals";
import {
  getISOWeekNumber,
  buildMultiYearTimelineData,
  getAllGridLines,
} from "./timeline-utils";
import type { components } from "@/api/v1";

type CropRotationWithPlot =
  components["schemas"]["GetV1CropRotationsPositiveResponse"]["data"]["result"][number];

const DEFAULT_CROP: CropRotationWithPlot["crop"] = {
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

let rotationCounter = 0;
function makeRotation(
  fromDate: string,
  toDate: string,
  cropName: string,
  plotId: string,
  plotName: string,
): CropRotationWithPlot {
  return {
    id: `rot-${++rotationCounter}`,
    farmId: "farm-1",
    plotId,
    cropId: "crop-1",
    sowingDate: null,
    fromDate,
    toDate,
    crop: { ...DEFAULT_CROP, name: cropName },
    plot: { name: plotName },
  };
}

// ---------------------------------------------------------------------------
// getISOWeekNumber
// ---------------------------------------------------------------------------

describe("getISOWeekNumber", () => {
  test("2025-06-16 (Monday) → W25", () => {
    expect(getISOWeekNumber(new Date(2025, 5, 16))).toBe(25);
  });

  test("2025-01-01 (Wednesday) → W1 of 2025", () => {
    expect(getISOWeekNumber(new Date(2025, 0, 1))).toBe(1);
  });

  test("2025-12-29 (Monday) → W1 of 2026 (ISO week crosses year boundary)", () => {
    expect(getISOWeekNumber(new Date(2025, 11, 29))).toBe(1);
  });

  test("2015-12-28 (Monday) → W53 of 2015", () => {
    expect(getISOWeekNumber(new Date(2015, 11, 28))).toBe(53);
  });

  test("2018-01-01 (Monday) → W1 of 2018", () => {
    expect(getISOWeekNumber(new Date(2018, 0, 1))).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// buildMultiYearTimelineData
// ---------------------------------------------------------------------------

describe("buildMultiYearTimelineData", () => {
  test("epoch: years=[2024,2025], epochStart=2024-01-01", () => {
    const result = buildMultiYearTimelineData([], [2024, 2025]);
    expect(result.epochStart).toEqual(new Date(2024, 0, 1));
    expect(result.years).toEqual([2024, 2025]);
    // 2024 is leap: 366+365=731 days, but totalDays = days between Jan 1 2024 and Dec 31 2025 23:59:59.999 + 1
    expect(result.totalDays).toBe(731);
  });

  test("single rotation: startDay/endDay and bar metadata correct", () => {
    const epochStart = new Date(2024, 0, 1);
    const MS_PER_DAY = 86_400_000;
    const rotation = makeRotation(
      "2024-03-01T00:00:00.000Z",
      "2024-05-31T00:00:00.000Z",
      "Corn",
      "plot-1",
      "Field A",
    );
    const result = buildMultiYearTimelineData([rotation], [2024, 2025]);
    expect(result.plots).toHaveLength(1);
    const plot = result.plots[0];
    expect(plot.plotId).toBe("plot-1");
    expect(plot.plotName).toBe("Field A");
    expect(plot.bars).toHaveLength(1);
    const bar = plot.bars[0];
    expect(bar.cropName).toBe("Corn");
    expect(bar.plotName).toBe("Field A");
    expect(bar.plotId).toBe("plot-1");
    const expectedStart = Math.floor(
      (new Date("2024-03-01T00:00:00.000Z").getTime() - epochStart.getTime()) /
        MS_PER_DAY,
    );
    expect(bar.startDay).toBe(expectedStart);
  });

  test("open-ended rotation (toDate=4999-12-31): isOpenEnded=true, endDay at epoch end", () => {
    const rotation = makeRotation(
      "2024-06-01T00:00:00.000Z",
      "4999-12-31T00:00:00Z",
      "Rye",
      "plot-1",
      "Field A",
    );
    const result = buildMultiYearTimelineData([rotation], [2024, 2025]);
    const bar = result.plots[0].bars[0];
    expect(bar.isOpenEnded).toBe(true);
    // endDay = daysBetween(epochStart, epochEnd) = totalDays - 1
    expect(bar.endDay).toBe(result.totalDays - 1);
  });

  test("rotation before epoch: excluded", () => {
    const rotation = makeRotation(
      "2020-01-01T00:00:00.000Z",
      "2021-12-31T00:00:00.000Z",
      "Oats",
      "plot-1",
      "Field A",
    );
    const result = buildMultiYearTimelineData([rotation], [2024, 2025]);
    expect(result.plots).toHaveLength(0);
  });

  test("rotation after epoch: excluded", () => {
    const rotation = makeRotation(
      "2027-01-01T00:00:00.000Z",
      "2027-12-31T00:00:00.000Z",
      "Barley",
      "plot-1",
      "Field A",
    );
    const result = buildMultiYearTimelineData([rotation], [2024, 2025]);
    expect(result.plots).toHaveLength(0);
  });

  test("rotation partially outside: clamped to epoch boundary", () => {
    const rotation = makeRotation(
      "2023-06-01T00:00:00.000Z",
      "2024-06-01T00:00:00.000Z",
      "Hemp",
      "plot-1",
      "Field A",
    );
    const result = buildMultiYearTimelineData([rotation], [2024, 2025]);
    const bar = result.plots[0].bars[0];
    expect(bar.startDay).toBe(0); // clamped to epochStart
  });

  test("multiple plots: sorted alphabetically by plotName", () => {
    const rotA = makeRotation(
      "2024-01-01T00:00:00.000Z",
      "2024-06-30T00:00:00.000Z",
      "Crop",
      "p-z",
      "Zeta Field",
    );
    const rotB = makeRotation(
      "2024-01-01T00:00:00.000Z",
      "2024-06-30T00:00:00.000Z",
      "Crop",
      "p-a",
      "Alpha Field",
    );
    const result = buildMultiYearTimelineData([rotA, rotB], [2024]);
    expect(result.plots[0].plotName).toBe("Alpha Field");
    expect(result.plots[1].plotName).toBe("Zeta Field");
  });

  test("allPlots: plots with no rotations appear with empty bars", () => {
    const rotation = makeRotation(
      "2024-03-01T00:00:00.000Z",
      "2024-05-31T00:00:00.000Z",
      "Corn",
      "p-1",
      "Field 1",
    );
    const allPlots = [
      { id: "p-1", name: "Field 1" },
      { id: "p-2", name: "Field 2" },
    ];
    const result = buildMultiYearTimelineData([rotation], [2024], allPlots);
    expect(result.plots).toHaveLength(2);
    const emptyPlot = result.plots.find((p) => p.plotId === "p-2");
    expect(emptyPlot?.bars).toHaveLength(0);
  });

  test("multiple bars per plot: sorted by startDay", () => {
    const rot1 = makeRotation(
      "2024-07-01T00:00:00.000Z",
      "2024-09-30T00:00:00.000Z",
      "Sunflower",
      "p-1",
      "Field 1",
    );
    const rot2 = makeRotation(
      "2024-01-01T00:00:00.000Z",
      "2024-03-31T00:00:00.000Z",
      "Wheat",
      "p-1",
      "Field 1",
    );
    const result = buildMultiYearTimelineData([rot1, rot2], [2024]);
    const bars = result.plots[0].bars;
    expect(bars[0].startDay).toBeLessThan(bars[1].startDay);
    expect(bars[0].cropName).toBe("Wheat");
  });
});

// ---------------------------------------------------------------------------
// getAllGridLines
// ---------------------------------------------------------------------------

describe("getAllGridLines", () => {
  const epochStart = new Date(2025, 0, 1); // Jan 1 2025 (local)
  const totalDays = 365;

  test("years: one entry, isMajor=true, label=year string, day=0 for 2025", () => {
    const lines = getAllGridLines(totalDays, epochStart, "years");
    expect(lines.length).toBeGreaterThan(0);
    lines.forEach((l) => expect(l.isMajor).toBe(true));
    const jan2025 = lines.find((l) => l.label === "2025");
    expect(jan2025).toBeDefined();
    expect(jan2025!.day).toBe(0);
  });

  test("years: no lines with day < 0 or day > totalDays", () => {
    const lines = getAllGridLines(totalDays, epochStart, "years");
    lines.forEach((l) => {
      expect(l.day).toBeGreaterThanOrEqual(0);
      expect(l.day).toBeLessThanOrEqual(totalDays);
    });
  });

  test("months: 13 lines for a single-year epoch (includes Jan of following year at day=totalDays)", () => {
    const lines = getAllGridLines(totalDays, epochStart, "months");
    // epochStart=2025-01-01, totalDays=365 → endDate=2026-01-01 (day=365=totalDays), so 13 lines
    expect(lines).toHaveLength(13);
  });

  test("months: January has isMajor=true and includes year in label", () => {
    const lines = getAllGridLines(totalDays, epochStart, "months");
    const jan = lines.find((l) => l.label.startsWith("Jan"));
    expect(jan).toBeDefined();
    expect(jan!.isMajor).toBe(true);
    expect(jan!.label).toContain("2025");
    expect(jan!.day).toBe(0);
  });

  test("months: non-January months have isMajor=false", () => {
    const lines = getAllGridLines(totalDays, epochStart, "months");
    lines
      .filter((l) => !l.label.startsWith("Jan"))
      .forEach((l) => expect(l.isMajor).toBe(false));
  });

  test("months: no lines with day < 0 or day > totalDays", () => {
    const lines = getAllGridLines(totalDays, epochStart, "months");
    lines.forEach((l) => {
      expect(l.day).toBeGreaterThanOrEqual(0);
      expect(l.day).toBeLessThanOrEqual(totalDays);
    });
  });

  test("weeks: labels follow W{n} or 'MMM W{n}' format", () => {
    const lines = getAllGridLines(totalDays, epochStart, "weeks");
    expect(lines.length).toBeGreaterThan(0);
    lines.forEach((l) => {
      expect(l.label).toMatch(/W\d+/);
    });
  });

  test("weeks: no lines with day < 0 or day > totalDays", () => {
    const lines = getAllGridLines(totalDays, epochStart, "weeks");
    lines.forEach((l) => {
      expect(l.day).toBeGreaterThanOrEqual(0);
      expect(l.day).toBeLessThanOrEqual(totalDays);
    });
  });

  test("weeks: first week of month lines have isMajor=true, others false", () => {
    const lines = getAllGridLines(totalDays, epochStart, "weeks");
    lines.forEach((l) => {
      // Lines with month prefix (e.g. "Jan W1") should be major
      const hasMonthPrefix = /^[A-Z][a-z]{2} W/.test(l.label);
      expect(l.isMajor).toBe(hasMonthPrefix);
    });
  });
});
