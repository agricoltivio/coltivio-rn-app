import { CropProtectionApplicationMethod } from "@/api/cropProtectionApplications.api";
import { CropProtectionUnit } from "@/api/cropProtectionProducts.api";

export const methodSelectData = [
  {
    value: "broadcasting",
    label: getMethodLabel("broadcasting"),
  },
  {
    value: "injektion",
    label: getMethodLabel("injecting"),
  },
  {
    value: "misting",
    label: getMethodLabel("misting"),
  },
  {
    value: "spraying",
    label: getMethodLabel("spraying"),
  },
  {
    value: "other",
    label: getMethodLabel("other"),
  },
];

export function getMethodLabel(method: CropProtectionApplicationMethod) {
  const labels: Record<CropProtectionApplicationMethod, string> = {
    broadcasting: "Flächendeckend",
    injecting: "Injektion",
    misting: "Vernebeln",
    spraying: "Sprühen",
    other: "Andere",
  };

  return labels[method];
}

export function getUnitLabel(unit: CropProtectionUnit) {
  const labels: Record<CropProtectionUnit, string> = {
    kg: "Kilogramm",
    l: "Liter",
    ml: "Milliliter",
    g: "Gramm",
  };
  return labels[unit];
}
