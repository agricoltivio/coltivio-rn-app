import { PlotCropRotation } from "@/api/crop-rotations.api";
import { addYears, isWithinInterval } from "date-fns";

/**
 * Expands a rotation with recurrence into individual occurrences within a date range.
 * Matches the backend expandRecurrence logic.
 */
export function expandRecurrence(
  rotation: PlotCropRotation,
  queryFromDate: Date,
  queryToDate: Date,
): PlotCropRotation[] {
  const recurrence = (rotation as PlotCropRotation & { recurrence?: { interval: number; until?: string } }).recurrence;

  if (!recurrence) {
    // No recurrence, return as-is if within range
    const rotationStart = new Date(rotation.fromDate);
    const rotationEnd = new Date(rotation.toDate);
    if (
      isWithinInterval(rotationStart, { start: queryFromDate, end: queryToDate }) ||
      isWithinInterval(rotationEnd, { start: queryFromDate, end: queryToDate }) ||
      (rotationStart <= queryFromDate && rotationEnd >= queryToDate)
    ) {
      return [rotation];
    }
    return [];
  }

  const { until, interval } = recurrence;
  const untilDate = until ? new Date(until) : undefined;
  const entries: PlotCropRotation[] = [];

  // Calculate duration of the rotation (how many days it lasts)
  const fromDate = new Date(rotation.fromDate);
  const toDate = new Date(rotation.toDate);
  const durationMs = toDate.getTime() - fromDate.getTime();

  let currentDate = fromDate;
  let iterationCount = 0;

  while (true) {
    // Check if we've exceeded the recurrence limit
    if (untilDate && currentDate > untilDate) break;

    // Calculate the end date for this occurrence
    const occurrenceEnd = new Date(currentDate.getTime() + durationMs);

    // Check if this occurrence is after the query range
    if (currentDate > queryToDate) break;

    // Only include if within the query range
    if (
      isWithinInterval(currentDate, { start: queryFromDate, end: queryToDate }) ||
      isWithinInterval(occurrenceEnd, { start: queryFromDate, end: queryToDate }) ||
      (currentDate <= queryFromDate && occurrenceEnd >= queryToDate)
    ) {
      entries.push({
        ...rotation,
        fromDate: currentDate.toISOString(),
        toDate: occurrenceEnd.toISOString(),
      });
    }

    currentDate = addYears(currentDate, interval);
    iterationCount++;

    // Safety check to prevent infinite loops
    if (iterationCount > 1000) {
      console.warn("Recurrence expansion exceeded 1000 iterations, stopping");
      break;
    }
  }

  return entries;
}

/**
 * Expands all rotations with recurrence into individual occurrences.
 */
export function expandAllRecurrences(
  rotations: PlotCropRotation[],
  queryFromDate: Date,
  queryToDate: Date,
): PlotCropRotation[] {
  return rotations.flatMap(rotation => expandRecurrence(rotation, queryFromDate, queryToDate));
}
