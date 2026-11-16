import { parseDateOnly, toLocalDateString } from "@/utils/date";
import { addDays } from "date-fns";
import type { Drug } from "@/api/drugs.api";

type DrugTreatment = Drug["drugTreatment"][number];

// What the proposal depends on. A change of one of these (by the user) proposes values again.
export type DrugProposalInputs = {
  drugId: string | undefined;
  animalType: string | undefined;
  // End of the treatment as "YYYY-MM-DD"
  endDay: string | undefined;
};

export type UsableDays = {
  milk: string | undefined;
  meat: string | undefined;
  organs: string | undefined;
};

// Per field: absent means leave the field as it is, null means clear it
export type DrugProposal = {
  flags?: {
    isAntibiotic: boolean;
    criticalAntibiotic: boolean;
    receivedFrom: string | undefined;
  };
  dose?: {
    value: string;
    unit: DrugTreatment["doseUnit"];
    perUnit: DrugTreatment["dosePerUnit"];
  } | null;
  usableDays?: {
    milk?: string | null;
    meat?: string | null;
    organs?: string | null;
  };
};

function dayPlus(day: string, days: number): string {
  return toLocalDateString(addDays(parseDateOnly(day), days));
}

// Decides which treatment fields to fill from the drug, given what changed since the last run:
// - drug picked: antibiotic flags and supplier, and dose and usable dates for the animal type
// - animals of another type picked once a drug is picked: dose and usable dates for that type
// - end date changed: usable dates move along, but only those still at the date proposed for the old end
//   date. A date changed by hand (e.g. a longer withdrawal on vet instruction) stays.
// - drug without values for the animal type, or no drug: dose and dates cleared, entered by hand
// Values entered by hand are left alone otherwise. previous is null on the first run, which shows the
// form as it is (a saved treatment keeps its saved values).
export function proposeDrugValues({
  previous,
  current,
  drug,
  drugTreatment,
  drugPickedByUser,
  usableDays,
}: {
  previous: DrugProposalInputs | null;
  current: DrugProposalInputs;
  drug:
    | Pick<Drug, "isAntibiotic" | "criticalAntibiotic" | "receivedFrom">
    | undefined;
  // The drug's values for the animal type, undefined when it has none or no animals are selected
  drugTreatment: DrugTreatment | undefined;
  // The user changed the drug field, so animals selected afterwards get the drug's values
  drugPickedByUser: boolean;
  usableDays: UsableDays;
}): DrugProposal {
  if (!previous) return {};
  const drugChanged = previous.drugId !== current.drugId;
  // Animals finishing loading is no change, picking animals after the drug is
  const animalTypeChanged =
    previous.animalType !== current.animalType &&
    (previous.animalType !== undefined || drugPickedByUser);
  const endDayChanged = previous.endDay !== current.endDay;
  if (!drugChanged && !animalTypeChanged && !endDayChanged) return {};

  if (!drug) {
    if (!drugChanged) return {};
    // Drug removed: no antibiotic flags, dose or withdrawal period
    return {
      flags: {
        isAntibiotic: false,
        criticalAntibiotic: false,
        receivedFrom: undefined,
      },
      dose: null,
      usableDays: { milk: null, meat: null, organs: null },
    };
  }

  const proposal: DrugProposal = {};
  if (drugChanged) {
    proposal.flags = {
      isAntibiotic: drug.isAntibiotic,
      criticalAntibiotic: drug.criticalAntibiotic,
      receivedFrom: drug.receivedFrom ?? undefined,
    };
  }

  const newDrugOrType = drugChanged || animalTypeChanged;
  if (drugTreatment) {
    if (newDrugOrType) {
      proposal.dose = {
        value: String(drugTreatment.doseValue),
        unit: drugTreatment.doseUnit,
        perUnit: drugTreatment.dosePerUnit,
      };
    }
    const endDay = current.endDay;
    if (endDay) {
      const waitingDays = {
        milk: drugTreatment.milkWaitingDays,
        meat: drugTreatment.meatWaitingDays,
        organs: drugTreatment.organsWaitingDays,
      };
      const proposedDays: { milk?: string; meat?: string; organs?: string } =
        {};
      for (const kind of ["milk", "meat", "organs"] as const) {
        const previouslyProposedDay =
          previous.endDay !== undefined
            ? dayPlus(previous.endDay, waitingDays[kind])
            : undefined;
        // On an end date change only the dates still at their proposal move along
        if (newDrugOrType || usableDays[kind] === previouslyProposedDay) {
          proposedDays[kind] = dayPlus(endDay, waitingDays[kind]);
        }
      }
      proposal.usableDays = proposedDays;
    }
  } else if (current.animalType && newDrugOrType) {
    // Nothing to propose, don't keep the values of a previously selected drug or animal type
    proposal.dose = null;
    proposal.usableDays = { milk: null, meat: null, organs: null };
  }
  return proposal;
}
