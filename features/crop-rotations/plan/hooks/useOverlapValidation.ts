import { useMemo } from "react";
import { PlotCropRotation } from "@/api/crop-rotations.api";
import { RotationEntry } from "../plan-crop-rotations.store";
import { hasOverlap, DateRange } from "./useExpandRecurrence";

export type ConflictInfo = {
  conflictingEntryId?: string;
  conflictingRotationId?: string;
  conflictingCropName?: string;
  conflictingFromDate?: Date;
  conflictingToDate?: Date;
};

export type OverlapWarning = {
  entryId: string;
  message: string;
  conflict?: ConflictInfo;
};

export function useOverlapValidation(
  plotId: string,
  plannedRotations: RotationEntry[],
  existingRotations: PlotCropRotation[]
): Map<string, OverlapWarning> {
  return useMemo(() => {
    const warnings = new Map<string, OverlapWarning>();

    plannedRotations.forEach((rotation, index) => {
      if (!rotation.cropId) return;

      const rotationRanges = expandRotation(rotation);

      // Check against other planned rotations
      for (let i = index + 1; i < plannedRotations.length; i++) {
        const otherRotation = plannedRotations[i];
        if (!otherRotation.cropId) continue;
        // Skip checking against self (in case of editing existing)
        if (rotation.rotationId && otherRotation.rotationId === rotation.rotationId) continue;

        const otherRanges = expandRotation(otherRotation);
        if (hasOverlap(rotationRanges, otherRanges)) {
          warnings.set(rotation.entryId, {
            entryId: rotation.entryId,
            message: "Overlaps with another planned rotation",
            conflict: {
              conflictingEntryId: otherRotation.entryId,
              conflictingRotationId: otherRotation.rotationId,
              conflictingFromDate: otherRotation.fromDate,
              conflictingToDate: otherRotation.toDate,
            },
          });
          break;
        }
      }

      // Check against existing rotations not already in our plan
      if (!warnings.has(rotation.entryId)) {
        for (const existingRotation of existingRotations) {
          if (existingRotation.plotId !== plotId) continue;
          // Skip if this existing rotation is already being edited in our plan
          if (rotation.rotationId === existingRotation.id) continue;
          const isInPlan = plannedRotations.some(r => r.rotationId === existingRotation.id);
          if (isInPlan) continue;

          const existingRanges: DateRange[] = [{
            from: new Date(existingRotation.fromDate),
            to: new Date(existingRotation.toDate),
          }];

          if (hasOverlap(rotationRanges, existingRanges)) {
            warnings.set(rotation.entryId, {
              entryId: rotation.entryId,
              message: `Overlaps with ${existingRotation.crop.name}`,
              conflict: {
                conflictingRotationId: existingRotation.id,
                conflictingCropName: existingRotation.crop.name,
                conflictingFromDate: new Date(existingRotation.fromDate),
                conflictingToDate: new Date(existingRotation.toDate),
              },
            });
            break;
          }
        }
      }
    });

    return warnings;
  }, [plotId, plannedRotations, existingRotations]);
}

function expandRotation(rotation: RotationEntry): DateRange[] {
  if (!rotation.recurrence || !rotation.recurrence.until) {
    return [{ from: rotation.fromDate, to: rotation.toDate }];
  }

  const ranges: DateRange[] = [];
  const maxDate = rotation.recurrence.until;

  let currentFrom = new Date(rotation.fromDate);
  let currentTo = new Date(rotation.toDate);

  while (currentFrom <= maxDate) {
    ranges.push({ from: new Date(currentFrom), to: new Date(currentTo) });
    currentFrom = addYears(currentFrom, rotation.recurrence.interval);
    currentTo = addYears(currentTo, rotation.recurrence.interval);
    if (currentFrom > maxDate) break;
  }

  return ranges;
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}
