import { describe, test, expect } from "@jest/globals";
import {
  proposeDrugValues,
  type DrugProposalInputs,
} from "./treatmentDrugProposal";

// Drug with values for goats: 2 mg/kg, milk 0 days, meat 5 days, organs 3 days
const drug = {
  isAntibiotic: true,
  criticalAntibiotic: false,
  receivedFrom: "Tierarzt",
};
const goatTreatment = {
  id: "goat-treatment",
  drugId: "drug",
  animalType: "goat" as const,
  doseValue: 2,
  doseUnit: "mg" as const,
  dosePerUnit: "kg" as const,
  milkWaitingDays: 0,
  meatWaitingDays: 5,
  organsWaitingDays: 3,
};
const noDays = { milk: undefined, meat: undefined, organs: undefined };
const goatsWithDrug: DrugProposalInputs = {
  drugId: "drug",
  animalType: "goat",
  endDay: "2026-11-18",
};

describe("proposeDrugValues", () => {
  test("first run proposes nothing, the form shows the saved values", () => {
    expect(
      proposeDrugValues({
        previous: null,
        current: goatsWithDrug,
        drug,
        drugTreatment: goatTreatment,
        drugPickedByUser: false,
        savedAnimalTypes: [],
        usableDays: noDays,
      }),
    ).toEqual({});
  });

  test("picking a drug proposes flags, dose and usable dates (0 waiting days: the end date)", () => {
    expect(
      proposeDrugValues({
        previous: { ...goatsWithDrug, drugId: undefined },
        current: goatsWithDrug,
        drug,
        drugTreatment: goatTreatment,
        drugPickedByUser: true,
        savedAnimalTypes: [],
        usableDays: noDays,
      }),
    ).toEqual({
      flags: {
        isAntibiotic: true,
        criticalAntibiotic: false,
        receivedFrom: "Tierarzt",
      },
      dose: { value: "2", unit: "mg", perUnit: "kg" },
      usableDays: {
        milk: "2026-11-18",
        meat: "2026-11-23",
        organs: "2026-11-21",
      },
    });
  });

  test("drug picked before the animals: only the flags, dose and dates once animals are picked", () => {
    const beforeAnimals = proposeDrugValues({
      previous: {
        drugId: undefined,
        animalType: undefined,
        endDay: "2026-11-18",
      },
      current: { drugId: "drug", animalType: undefined, endDay: "2026-11-18" },
      drug,
      drugTreatment: undefined,
      drugPickedByUser: true,
      savedAnimalTypes: [],
      usableDays: noDays,
    });
    expect(beforeAnimals).toEqual({
      flags: {
        isAntibiotic: true,
        criticalAntibiotic: false,
        receivedFrom: "Tierarzt",
      },
    });

    const afterAnimals = proposeDrugValues({
      previous: { drugId: "drug", animalType: undefined, endDay: "2026-11-18" },
      current: goatsWithDrug,
      drug,
      drugTreatment: goatTreatment,
      drugPickedByUser: true,
      savedAnimalTypes: [],
      usableDays: noDays,
    });
    expect(afterAnimals).toEqual({
      dose: { value: "2", unit: "mg", perUnit: "kg" },
      usableDays: {
        milk: "2026-11-18",
        meat: "2026-11-23",
        organs: "2026-11-21",
      },
    });
  });

  test("animals finishing loading on a saved treatment proposes nothing", () => {
    expect(
      proposeDrugValues({
        previous: { ...goatsWithDrug, animalType: undefined },
        current: goatsWithDrug,
        drug,
        drugTreatment: goatTreatment,
        drugPickedByUser: false,
        savedAnimalTypes: [],
        usableDays: {
          milk: "2026-11-20",
          meat: "2026-12-01",
          organs: undefined,
        },
      }),
    ).toEqual({});
  });

  test("animals of another type propose that type's values", () => {
    const proposal = proposeDrugValues({
      previous: { ...goatsWithDrug, animalType: "cow" },
      current: goatsWithDrug,
      drug,
      drugTreatment: goatTreatment,
      drugPickedByUser: false,
      savedAnimalTypes: [],
      usableDays: { milk: "2026-11-21", meat: "2026-12-02", organs: undefined },
    });
    expect(proposal.dose).toEqual({ value: "2", unit: "mg", perUnit: "kg" });
    expect(proposal.usableDays).toEqual({
      milk: "2026-11-18",
      meat: "2026-11-23",
      organs: "2026-11-21",
    });
    expect(proposal.flags).toBeUndefined();
  });

  test("drug without values for the animal type clears dose and dates", () => {
    expect(
      proposeDrugValues({
        previous: { ...goatsWithDrug, drugId: "other" },
        current: goatsWithDrug,
        drug,
        drugTreatment: undefined,
        drugPickedByUser: true,
        savedAnimalTypes: [],
        usableDays: {
          milk: "2026-11-20",
          meat: "2026-11-30",
          organs: undefined,
        },
      }),
    ).toEqual({
      flags: {
        isAntibiotic: true,
        criticalAntibiotic: false,
        receivedFrom: "Tierarzt",
      },
      dose: null,
      usableDays: { milk: null, meat: null, organs: null },
    });
  });

  test("removing the drug clears flags, dose and dates", () => {
    expect(
      proposeDrugValues({
        previous: goatsWithDrug,
        current: { ...goatsWithDrug, drugId: undefined },
        drug: undefined,
        drugTreatment: undefined,
        drugPickedByUser: true,
        savedAnimalTypes: [],
        usableDays: {
          milk: "2026-11-18",
          meat: "2026-11-23",
          organs: "2026-11-21",
        },
      }),
    ).toEqual({
      flags: {
        isAntibiotic: false,
        criticalAntibiotic: false,
        receivedFrom: undefined,
      },
      dose: null,
      usableDays: { milk: null, meat: null, organs: null },
    });
  });

  test("end date change moves the proposed dates and keeps the dose", () => {
    expect(
      proposeDrugValues({
        previous: goatsWithDrug,
        current: { ...goatsWithDrug, endDay: "2026-11-20" },
        drug,
        drugTreatment: goatTreatment,
        drugPickedByUser: true,
        savedAnimalTypes: [],
        usableDays: {
          milk: "2026-11-18",
          meat: "2026-11-23",
          organs: "2026-11-21",
        },
      }),
    ).toEqual({
      usableDays: {
        milk: "2026-11-20",
        meat: "2026-11-25",
        organs: "2026-11-23",
      },
    });
  });

  test("end date change keeps a date changed by hand, e.g. a longer withdrawal on vet instruction", () => {
    expect(
      proposeDrugValues({
        previous: goatsWithDrug,
        current: { ...goatsWithDrug, endDay: "2026-11-20" },
        drug,
        drugTreatment: goatTreatment,
        drugPickedByUser: true,
        savedAnimalTypes: [],
        // Meat lengthened by hand from 23.11 to 10.12, organs cleared by hand
        usableDays: {
          milk: "2026-11-18",
          meat: "2026-12-10",
          organs: undefined,
        },
      }),
    ).toEqual({ usableDays: { milk: "2026-11-20" } });
  });

  test("end date change with a drug without values for the type keeps everything entered by hand", () => {
    expect(
      proposeDrugValues({
        previous: goatsWithDrug,
        current: { ...goatsWithDrug, endDay: "2026-11-20" },
        drug,
        drugTreatment: undefined,
        drugPickedByUser: true,
        savedAnimalTypes: [],
        usableDays: {
          milk: "2026-11-25",
          meat: "2026-11-30",
          organs: undefined,
        },
      }),
    ).toEqual({});
  });

  test("end date change without a drug proposes nothing", () => {
    expect(
      proposeDrugValues({
        previous: { ...goatsWithDrug, drugId: undefined },
        current: { ...goatsWithDrug, drugId: undefined, endDay: "2026-11-20" },
        drug: undefined,
        drugTreatment: undefined,
        drugPickedByUser: false,
        savedAnimalTypes: [],
        usableDays: noDays,
      }),
    ).toEqual({});
  });

  test("removing animals from an older mixed treatment keeps its saved values", () => {
    expect(
      proposeDrugValues({
        previous: { ...goatsWithDrug, animalType: "cow" },
        current: goatsWithDrug,
        drug,
        drugTreatment: goatTreatment,
        drugPickedByUser: false,
        savedAnimalTypes: ["cow", "goat"],
        usableDays: {
          milk: "2026-11-21",
          meat: "2026-12-02",
          organs: undefined,
        },
      }),
    ).toEqual({});
  });
});
