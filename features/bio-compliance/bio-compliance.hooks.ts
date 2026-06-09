import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAnimalsQuery } from "@/features/animals/animals.hooks";
import { useOutdoorJournalQuery } from "@/features/animals/outdoor-journal.hooks";
import { useTreatmentsQuery } from "@/features/animals/treatments.hooks";
import { useCropRotationsQuery } from "@/features/crop-rotations/crop-rotations.hooks";
import { useFertilizerApplicationsQuery } from "@/features/fertilizer-application/fertilizerApplications.hooks";
import { usePermissions } from "@/features/user/users.hooks";
import {
  checkAntibioticCount,
  checkCriticalAntibiotic,
  checkMineralFertilizer,
  checkRausCoverage,
  checkRotationPause,
  checkWithdrawalStatus,
} from "./rules";
import { CheckResult } from "./rules/types";

const CURRENT_YEAR = new Date().getFullYear();
const ROTATIONS_FROM = new Date(CURRENT_YEAR - 15, 0, 1);
const ROTATIONS_TO = new Date(CURRENT_YEAR + 1, 11, 31);
const YEAR_FROM = new Date(CURRENT_YEAR, 0, 1).toISOString();
const YEAR_TO = new Date(CURRENT_YEAR, 11, 31, 23, 59, 59).toISOString();

export function useBioComplianceChecks() {
  const { t } = useTranslation();
  const { canRead } = usePermissions();
  const canField = canRead("field_calendar");
  const canAnimals = canRead("animals");

  const { cropRotations, isPending: rotationsPending } = useCropRotationsQuery(
    ROTATIONS_FROM,
    ROTATIONS_TO,
    canField,
    { expand: true, withRecurrences: false },
  );
  const { fertilizerApplications, isPending: fertilizerPending } =
    useFertilizerApplicationsQuery(undefined, undefined, canField);
  const { treatments, isPending: treatmentsPending } =
    useTreatmentsQuery(canAnimals);
  const { animals, isPending: animalsPending } = useAnimalsQuery(
    false,
    undefined,
    canAnimals,
  );
  const { data: outdoorData, isPending: outdoorPending } =
    useOutdoorJournalQuery(YEAR_FROM, YEAR_TO);

  const results = useMemo<CheckResult[]>(() => {
    const out: CheckResult[] = [];

    if (canField) {
      out.push(checkRotationPause(cropRotations ?? []));
      out.push(checkMineralFertilizer(fertilizerApplications ?? []));
    }

    if (canAnimals) {
      const allAnimals = animals ?? [];
      const hasCattle = allAnimals.some((a) => a.type === "cow");
      out.push(checkAntibioticCount(treatments ?? [], allAnimals));
      out.push(checkCriticalAntibiotic(treatments ?? []));
      out.push(
        checkWithdrawalStatus(treatments ?? [], {
          milk: t("bio_compliance.withdrawalKinds.milk"),
          meat: t("bio_compliance.withdrawalKinds.meat"),
          organs: t("bio_compliance.withdrawalKinds.organs"),
        }),
      );
      out.push(
        checkRausCoverage(outdoorData?.entries ?? [], CURRENT_YEAR, hasCattle),
      );
    }

    return out;
  }, [
    t,
    canField,
    canAnimals,
    cropRotations,
    fertilizerApplications,
    treatments,
    animals,
    outdoorData,
  ]);

  const isLoading =
    (canField && (rotationsPending || fertilizerPending)) ||
    (canAnimals && (treatmentsPending || animalsPending || outdoorPending));

  return { results, isLoading, canField, canAnimals };
}
