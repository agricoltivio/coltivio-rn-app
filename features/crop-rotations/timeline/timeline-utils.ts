import { components } from "@/api/v1";
import { isInfiniteDate } from "@/utils/date";

type CropRotationWithPlot =
  components["schemas"]["GetV1CropRotationsPositiveResponse"]["data"]["result"][number];

export type TimelineBar = {
  rotationId: string;
  entryId: string; // for editing reference
  cropName: string;
  plotName: string;
  plotId: string;
  startDay: number; // days since epochStart
  endDay: number; // days since epochStart
  isOpenEnded: boolean;
  isPlanned?: boolean;
  hasConflict?: boolean;
};

export type TimelinePlotData = {
  plotId: string;
  plotName: string;
  bars: TimelineBar[];
};

export type TimelineData = {
  plots: TimelinePlotData[];
  epochStart: Date; // Jan 1 of earliest year
  totalDays: number;
  years: number[];
};

export type GridLine = {
  day: number;
  label: string;
  isMajor: boolean;
};

const MS_PER_DAY = 86_400_000;

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY);
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type SimplePlot = { id: string; name: string };

// Builds a TimelineData with the correct epoch/grid but no bars — cheap to
// compute and can be shown immediately while the full expansion is pending.
export function buildSkeletonTimelineData(
  plots: SimplePlot[],
  years: number[],
): TimelineData {
  const sortedYears = [...years].sort((a, b) => a - b);
  const epochStart = new Date(sortedYears[0], 0, 1);
  const epochEnd = new Date(sortedYears[sortedYears.length - 1], 11, 31, 23, 59, 59, 999);
  const totalDays = daysBetween(epochStart, epochEnd) + 1;
  return {
    epochStart,
    totalDays,
    years: sortedYears,
    plots: plots.map((p) => ({ plotId: p.id, plotName: p.name, bars: [] })),
  };
}

// Expands base (non-expanded) crop rotations that have recurrence info into
// individual per-occurrence entries within the given year range.
// Rotations without recurrence are returned as-is.
export function expandRotations(
  rotations: CropRotationWithPlot[],
  fromYear: number,
  toYear: number,
): CropRotationWithPlot[] {
  const epochStart = new Date(fromYear, 0, 1);
  const epochEnd = new Date(toYear, 11, 31, 23, 59, 59, 999);
  const result: CropRotationWithPlot[] = [];

  for (const rotation of rotations) {
    if (!rotation.recurrence) {
      result.push(rotation);
      continue;
    }

    const { interval, until } = rotation.recurrence;
    const untilDate = until ? new Date(until) : epochEnd;
    const effectiveEnd = untilDate < epochEnd ? untilDate : epochEnd;

    let currentFrom = new Date(rotation.fromDate);
    let currentTo = new Date(rotation.toDate);
    const durationMs = currentTo.getTime() - currentFrom.getTime();

    let iteration = 0;
    while (currentFrom <= effectiveEnd && iteration < 200) {
      if (currentTo >= epochStart) {
        result.push({
          ...rotation,
          fromDate: currentFrom.toISOString(),
          toDate: currentTo.toISOString(),
          // Clear recurrence on expanded instances so buildMultiYearTimelineData
          // treats each as a standalone bar
          recurrence: null,
        });
      }
      currentFrom = new Date(
        currentFrom.getFullYear() + interval,
        currentFrom.getMonth(),
        currentFrom.getDate(),
      );
      currentTo = new Date(currentFrom.getTime() + durationMs);
      iteration++;
    }
  }

  return result;
}

// Groups crop rotations by plot and calculates bar positions as absolute day offsets from epochStart.
// Open-ended rotations (infinite toDate) extend to epoch end with isOpenEnded flag.
// Dates are clamped to the epoch boundaries (Jan 1 earliest year .. Dec 31 latest year).
// When allPlots is provided, plots without any crop rotations are included as empty rows.
export function buildMultiYearTimelineData(
  cropRotations: CropRotationWithPlot[],
  years: number[],
  allPlots?: SimplePlot[],
): TimelineData {
  const sortedYears = [...years].sort((a, b) => a - b);
  const epochStart = new Date(sortedYears[0], 0, 1);
  const epochEnd = new Date(
    sortedYears[sortedYears.length - 1],
    11,
    31,
    23,
    59,
    59,
    999,
  );
  const totalDays = daysBetween(epochStart, epochEnd) + 1;

  const plotMap = new Map<string, { plotName: string; bars: TimelineBar[] }>();

  // Seed with all plots (empty bars) so they always appear
  if (allPlots) {
    for (const plot of allPlots) {
      plotMap.set(plot.id, { plotName: plot.name, bars: [] });
    }
  }

  for (const rotation of cropRotations) {
    const fromDate = new Date(rotation.fromDate);
    const toDateRaw = new Date(rotation.toDate);
    const isOpenEnded = isInfiniteDate(toDateRaw);
    const toDate = isOpenEnded ? epochEnd : toDateRaw;

    // Clamp to epoch boundaries
    const clampedFrom = fromDate < epochStart ? epochStart : fromDate;
    const clampedTo = toDate > epochEnd ? epochEnd : toDate;

    // Skip rotations entirely outside the epoch
    if (clampedFrom > epochEnd || clampedTo < epochStart) continue;

    const startDay = daysBetween(epochStart, clampedFrom);
    const endDay = daysBetween(epochStart, clampedTo);

    const bar: TimelineBar = {
      rotationId: rotation.id,
      entryId: rotation.id,
      cropName: rotation.crop.name,
      plotName: rotation.plot.name,
      plotId: rotation.plotId,
      startDay,
      endDay,
      isOpenEnded,
    };

    const existing = plotMap.get(rotation.plotId);
    if (existing) {
      existing.bars.push(bar);
    } else {
      plotMap.set(rotation.plotId, {
        plotName: rotation.plot.name,
        bars: [bar],
      });
    }
  }

  const plots = Array.from(plotMap.entries())
    .sort((a, b) => a[1].plotName.localeCompare(b[1].plotName))
    .map(([plotId, data]) => ({
      plotId,
      plotName: data.plotName,
      bars: data.bars.sort((a, b) => a.startDay - b.startDay),
    }));

  return { plots, epochStart, totalDays, years: sortedYears };
}

// Returns grid lines for the visible viewport only.
// Adapts granularity to zoom level: year → month → week boundaries.
export function getGridLines(
  visibleStartDay: number,
  visibleEndDay: number,
  epochStart: Date,
): GridLine[] {
  const visibleDays = visibleEndDay - visibleStartDay;
  const lines: GridLine[] = [];
  const epochMs = epochStart.getTime();

  if (visibleDays > 365 * 2) {
    // Year-level grid lines
    const startYear = new Date(
      epochMs + visibleStartDay * MS_PER_DAY,
    ).getFullYear();
    const endYear = new Date(
      epochMs + visibleEndDay * MS_PER_DAY,
    ).getFullYear();
    for (let year = startYear; year <= endYear + 1; year++) {
      const day = daysBetween(epochStart, new Date(year, 0, 1));
      if (day >= visibleStartDay - 30 && day <= visibleEndDay + 30) {
        lines.push({ day, label: String(year), isMajor: true });
      }
    }
  } else if (visibleDays > 60) {
    // Month-level grid lines
    const startDate = new Date(epochMs + visibleStartDay * MS_PER_DAY);
    const endDate = new Date(epochMs + visibleEndDay * MS_PER_DAY);
    const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (current <= endDate) {
      const day = daysBetween(epochStart, current);
      if (day >= visibleStartDay - 15 && day <= visibleEndDay + 15) {
        const isJanuary = current.getMonth() === 0;
        const label = isJanuary
          ? `${MONTH_SHORT[current.getMonth()]} ${current.getFullYear()}`
          : MONTH_SHORT[current.getMonth()];
        lines.push({ day, label, isMajor: isJanuary });
      }
      current.setMonth(current.getMonth() + 1);
    }
  } else {
    // Week-level grid lines
    const startDate = new Date(epochMs + visibleStartDay * MS_PER_DAY);
    const dayOfWeek = startDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(startDate);
    monday.setDate(monday.getDate() - daysToMonday);

    while (true) {
      const day = daysBetween(epochStart, monday);
      if (day > visibleEndDay + 7) break;
      if (day >= visibleStartDay - 7) {
        const weekNum = getISOWeekNumber(monday);
        const isFirstWeekOfMonth = monday.getDate() <= 7;
        lines.push({
          day,
          label: isFirstWeekOfMonth
            ? `${MONTH_SHORT[monday.getMonth()]} W${weekNum}`
            : `W${weekNum}`,
          isMajor: isFirstWeekOfMonth,
        });
      }
      monday.setDate(monday.getDate() + 7);
    }
  }

  return lines;
}

// Generate week-only grid lines (for the week number header row)
export function getWeekLines(
  visibleStartDay: number,
  visibleEndDay: number,
  epochStart: Date,
): GridLine[] {
  const lines: GridLine[] = [];
  const epochMs = epochStart.getTime();
  const startDate = new Date(epochMs + visibleStartDay * MS_PER_DAY);
  const dayOfWeek = startDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(startDate);
  monday.setDate(monday.getDate() - daysToMonday);

  while (true) {
    const day = daysBetween(epochStart, monday);
    if (day > visibleEndDay + 7) break;
    if (day >= visibleStartDay - 7) {
      const weekNum = getISOWeekNumber(monday);
      lines.push({
        day,
        label: `W${weekNum}`,
        isMajor: false,
      });
    }
    monday.setDate(monday.getDate() + 7);
  }
  return lines;
}

// Returns all grid lines for the entire content, granularity based on zoom level.
// Unlike getGridLines (which windows to a visible range), this renders everything.
export function getAllGridLines(
  totalDays: number,
  epochStart: Date,
  zoomLevel: "years" | "months" | "weeks",
): GridLine[] {
  const lines: GridLine[] = [];

  if (zoomLevel === "years") {
    const startYear = epochStart.getFullYear();
    const endDate = new Date(epochStart.getTime() + totalDays * MS_PER_DAY);
    const endYear = endDate.getFullYear();
    for (let year = startYear; year <= endYear + 1; year++) {
      const day = daysBetween(epochStart, new Date(year, 0, 1));
      if (day >= 0 && day <= totalDays) {
        lines.push({ day, label: String(year), isMajor: true });
      }
    }
  } else if (zoomLevel === "months") {
    const endDate = new Date(epochStart.getTime() + totalDays * MS_PER_DAY);
    const current = new Date(epochStart.getFullYear(), 0, 1);
    while (current <= endDate) {
      const day = daysBetween(epochStart, current);
      if (day >= 0 && day <= totalDays) {
        const isJanuary = current.getMonth() === 0;
        const label = isJanuary
          ? `${MONTH_SHORT[current.getMonth()]} ${current.getFullYear()}`
          : MONTH_SHORT[current.getMonth()];
        lines.push({ day, label, isMajor: isJanuary });
      }
      current.setMonth(current.getMonth() + 1);
    }
  } else {
    // Week boundaries (every Monday)
    const startDate = new Date(epochStart.getTime());
    const dayOfWeek = startDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(startDate);
    monday.setDate(monday.getDate() - daysToMonday);
    while (true) {
      const day = daysBetween(epochStart, monday);
      if (day > totalDays) break;
      if (day >= 0) {
        const weekNum = getISOWeekNumber(monday);
        const isFirstWeekOfMonth = monday.getDate() <= 7;
        lines.push({
          day,
          label: isFirstWeekOfMonth
            ? `${MONTH_SHORT[monday.getMonth()]} W${weekNum}`
            : `W${weekNum}`,
          isMajor: isFirstWeekOfMonth,
        });
      }
      monday.setDate(monday.getDate() + 7);
    }
  }

  return lines;
}

// Returns all week lines for the entire content (for the week number header row).
export function getAllWeekLines(
  totalDays: number,
  epochStart: Date,
): GridLine[] {
  const lines: GridLine[] = [];
  const startDate = new Date(epochStart.getTime());
  const dayOfWeek = startDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(startDate);
  monday.setDate(monday.getDate() - daysToMonday);
  while (true) {
    const day = daysBetween(epochStart, monday);
    if (day > totalDays) break;
    if (day >= 0) {
      const weekNum = getISOWeekNumber(monday);
      lines.push({ day, label: `W${weekNum}`, isMajor: false });
    }
    monday.setDate(monday.getDate() + 7);
  }
  return lines;
}

export function getISOWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
}
