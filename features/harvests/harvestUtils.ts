import { ConservationMethod, HarvestUnit } from "@/api/harvests.api";

export const harvestingUnits: HarvestUnit[] = [
  "load",
  "square_bale",
  "round_bale",
  "crate",
  "total_amount",
];

export const conservationsMethods: ConservationMethod[] = [
  "none",
  "dried",
  "haylage",
  "silage",
  "other",
];
