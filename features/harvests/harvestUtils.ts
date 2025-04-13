import { ConservationMethod } from "@/api/harvestingMachinery.api";
import { ProcessingType } from "@/api/harvests.api";

export const processingTypes: ProcessingType[] = [
  "none",
  "square_bale",
  "round_bale",
  "other",
];

export const conservationsMethods: ConservationMethod[] = [
  "none",
  "dried",
  "haylage",
  "silage",
  "other",
];
