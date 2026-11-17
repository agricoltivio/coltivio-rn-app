import {
  treatmentAnimalDosePayload,
  type TreatmentDoseAnimal,
} from "./TreatmentAnimalDoses";

// Dose 2 mg/kg; Akazia has a weight, Alba has none
function animal(overrides: Partial<TreatmentDoseAnimal>): TreatmentDoseAnimal {
  return {
    id: "akazia",
    name: "Akazia",
    earTagNumber: null,
    weightKg: null,
    weightDate: null,
    weightStatus: "ready",
    manualEffectiveDoseValue: null,
    ...overrides,
  };
}

describe("treatmentAnimalDosePayload", () => {
  it("create: weight on the start date gives dose × weight, no weight gives none", () => {
    const payload = treatmentAnimalDosePayload(
      [
        animal({ weightKg: 60, weightDate: "2026-11-10" }),
        animal({ id: "alba", name: "Alba" }),
      ],
      {},
      "2",
    );
    expect(payload).toEqual({
      animalWeights: [
        { animalId: "akazia", weightKg: 60 },
        { animalId: "alba", weightKg: null },
      ],
      effectiveDoseOverrides: [
        { animalId: "akazia", effectiveDoseValue: 120 },
        { animalId: "alba", effectiveDoseValue: null },
      ],
    });
  });

  it("edit: a typed amount is sent as typed", () => {
    const payload = treatmentAnimalDosePayload(
      [animal({ weightKg: 60 })],
      { akazia: "100" },
      "2",
    );
    expect(payload.effectiveDoseOverrides).toEqual([
      { animalId: "akazia", effectiveDoseValue: 100 },
    ]);
  });

  it("edit after start date change: amount entered by hand earlier stays with the new weight", () => {
    const payload = treatmentAnimalDosePayload(
      [
        animal({
          weightKg: 65,
          weightDate: "2026-11-17",
          manualEffectiveDoseValue: 100,
        }),
      ],
      {},
      "2",
    );
    expect(payload).toEqual({
      animalWeights: [{ animalId: "akazia", weightKg: 65 }],
      effectiveDoseOverrides: [{ animalId: "akazia", effectiveDoseValue: 100 }],
    });
  });

  it("a cleared input falls back to dose × weight, not to the amount entered earlier", () => {
    const payload = treatmentAnimalDosePayload(
      [animal({ weightKg: 65, manualEffectiveDoseValue: 100 })],
      { akazia: "" },
      "2",
    );
    expect(payload.effectiveDoseOverrides).toEqual([
      { animalId: "akazia", effectiveDoseValue: 130 },
    ]);
  });

  it("an invalid typed amount is sent as none", () => {
    const payload = treatmentAnimalDosePayload(
      [animal({ weightKg: 60 })],
      { akazia: "-5" },
      "2",
    );
    expect(payload.effectiveDoseOverrides).toEqual([
      { animalId: "akazia", effectiveDoseValue: null },
    ]);
  });
});
