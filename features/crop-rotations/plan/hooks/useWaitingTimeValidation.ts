import { useMemo } from "react";
import { PlotCropRotation } from "@/api/crop-rotations.api";
import { Crop } from "@/api/crops.api";
import { RotationEntry } from "../plan-crop-rotations.store";

export type WaitingTimeWarning = {
  entryId: string;
  message: string;
};

export function useWaitingTimeValidation(
  plotId: string,
  plannedRotations: RotationEntry[],
  existingRotations: PlotCropRotation[],
  crops: Crop[]
): Map<string, WaitingTimeWarning> {
  return useMemo(() => {
    const warnings = new Map<string, WaitingTimeWarning>();

    plannedRotations.forEach(rotation => {
      if (!rotation.cropId) return;

      const crop = crops.find(c => c.id === rotation.cropId);
      if (!crop) return;

      const existingPlotRotations = existingRotations.filter(r => r.plotId === plotId);

      const cropWaitingYears = crop.waitingTimeInYears;
      if (cropWaitingYears) {
        const lastCropRotation = existingPlotRotations
          .filter(r => r.cropId === crop.id)
          .sort((a, b) => {
            const aDate = new Date(a.toDate);
            const bDate = new Date(b.toDate);
            return bDate.getTime() - aDate.getTime();
          })[0];

        if (lastCropRotation) {
          const lastEndDate = new Date(lastCropRotation.toDate);
          const yearsSince = (rotation.fromDate.getTime() - lastEndDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

          if (yearsSince < cropWaitingYears) {
            warnings.set(rotation.entryId, {
              entryId: rotation.entryId,
              message: `Waiting time not met: Last ${crop.name} rotation was ${yearsSince.toFixed(1)} years ago, recommended waiting time is ${cropWaitingYears} years`,
            });
            return;
          }
        }
      }

      const familyWaitingYears = crop.family?.waitingTimeInYears;
      if (familyWaitingYears && crop.familyId) {
        const lastFamilyRotation = existingPlotRotations
          .filter(r => {
            const rCrop = crops.find(c => c.id === r.cropId);
            return rCrop?.familyId === crop.familyId;
          })
          .sort((a, b) => {
            const aDate = new Date(a.toDate);
            const bDate = new Date(b.toDate);
            return bDate.getTime() - aDate.getTime();
          })[0];

        if (lastFamilyRotation) {
          const lastEndDate = new Date(lastFamilyRotation.toDate);
          const yearsSince = (rotation.fromDate.getTime() - lastEndDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);

          if (yearsSince < familyWaitingYears) {
            warnings.set(rotation.entryId, {
              entryId: rotation.entryId,
              message: `Family waiting time not met: Last ${crop.family?.name} family rotation was ${yearsSince.toFixed(1)} years ago, recommended waiting time is ${familyWaitingYears} years`,
            });
          }
        }
      }
    });

    return warnings;
  }, [plotId, plannedRotations, existingRotations, crops]);
}
