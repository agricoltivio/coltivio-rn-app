// Shared result + structural input shapes for the Bio-Compliance MVP checks.
// Mirror of coltivio-web's bio-compliance rule types (see constants.ts header).
//
// Inputs are typed structurally (only the fields the rules read) so the rules
// stay decoupled from the generated API type names. The API payloads satisfy
// these shapes.

export type CheckStatus = "ok" | "warn" | "fail" | "info" | "no_data";

export type CheckId =
  | "rotationPause"
  | "mineralFertilizer"
  | "antibioticCount"
  | "criticalAntibiotic"
  | "withdrawalStatus"
  | "rausCoverage";

export type CheckDomain = "field" | "animal";

/** Where a flagged item links to, so the user can jump to the offending record. */
export type CheckLink =
  | { kind: "rotationPlot"; plotId: string }
  | { kind: "fertilizerApplication"; id: string }
  | { kind: "animal"; id: string }
  | { kind: "treatment"; id: string };

export type FailingItem = {
  label: string;
  detail?: string;
  link?: CheckLink;
};

export type CheckResult = {
  id: CheckId;
  domain: CheckDomain;
  status: CheckStatus;
  failingCount: number;
  items: FailingItem[];
};

// --- Structural inputs ---

export type BioRotation = {
  id: string;
  plotId: string;
  cropId: string;
  fromDate: string;
  toDate: string;
  recurrence: { interval: number; until: string | null } | null;
  crop: {
    id: string;
    name: string;
    waitingTimeInYears: number | null;
    familyId: string | null;
    family: { waitingTimeInYears: number } | null;
  };
  plot?: { name: string } | null;
};

export type BioFertilizerApplication = {
  id: string;
  date: string;
  fertilizer: { name: string; type: "mineral" | "organic" };
  plot?: { name: string } | null;
};

export type BioAnimal = {
  id: string;
  name: string;
  type: string;
  dateOfBirth: string;
  dateOfDeath: string | null;
};

export type BioTreatment = {
  id: string;
  isAntibiotic: boolean;
  criticalAntibiotic: boolean;
  antibiogramAvailable: boolean;
  startDate: string;
  endDate: string;
  name: string;
  milkUsableDate: string | null;
  meatUsableDate: string | null;
  organsUsableDate: string | null;
  animals: { id: string; name: string }[];
};

export type BioOutdoorEntry = {
  category: string;
  startDate: string;
  endDate: string;
};
