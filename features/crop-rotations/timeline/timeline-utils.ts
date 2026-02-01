import { components } from "@/api/v1";

type CropRotationWithPlot =
  components["schemas"]["GetV1CropRotationsPositiveResponse"]["data"]["result"][number];

export type TimelineBar = {
  rotationId: string;
  cropName: string;
  plotName: string;
  plotId: string;
  startFraction: number;
  endFraction: number;
  isOpenEnded: boolean;
};

export type TimelinePlotData = {
  plotId: string;
  plotName: string;
  bars: TimelineBar[];
};

// Groups crop rotations by plot and calculates bar positions as fractions of the year (0.0 = Jan 1, 1.0 = Dec 31).
// Open-ended rotations (toDate === null) extend to year end with isOpenEnded flag.
// Dates are clamped to the year boundaries.
export function buildTimelineData(
  cropRotations: CropRotationWithPlot[],
  year: number
): TimelinePlotData[] {
  const yearStart = new Date(year, 0, 1).getTime();
  const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999).getTime();
  const yearDuration = yearEnd - yearStart;

  const plotMap = new Map<
    string,
    { plotName: string; bars: TimelineBar[] }
  >();

  for (const rotation of cropRotations) {
    const fromTime = Math.max(new Date(rotation.fromDate).getTime(), yearStart);
    const isOpenEnded = rotation.toDate === null || rotation.toDate === undefined;
    const toTime = isOpenEnded
      ? yearEnd
      : Math.min(new Date(rotation.toDate!).getTime(), yearEnd);

    // Skip rotations entirely outside the year
    if (fromTime > yearEnd || toTime < yearStart) continue;

    const startFraction = (fromTime - yearStart) / yearDuration;
    const endFraction = (toTime - yearStart) / yearDuration;

    const bar: TimelineBar = {
      rotationId: rotation.id,
      cropName: rotation.crop.name,
      plotName: rotation.plot.name,
      plotId: rotation.plotId,
      startFraction,
      endFraction,
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

  // Sort plots alphabetically by name
  return Array.from(plotMap.entries())
    .sort((a, b) => a[1].plotName.localeCompare(b[1].plotName))
    .map(([plotId, data]) => ({
      plotId,
      plotName: data.plotName,
      bars: data.bars.sort((a, b) => a.startFraction - b.startFraction),
    }));
}
