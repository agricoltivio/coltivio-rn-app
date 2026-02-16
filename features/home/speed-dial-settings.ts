export type SpeedDialActionConfig = {
  id: string;
  active: boolean;
};

export const SPEED_DIAL_ACTIONS = {
  harvest: {
    translationKey: "speed_dial.harvest",
    icon: "fruit-cherries",
    route: "SelectHarvestCropAndDate",
  },
  tillage: {
    translationKey: "speed_dial.tillage",
    icon: "shovel",
    route: "SelectTillageDate",
  },
  cropProtection: {
    translationKey: "speed_dial.crop_protection",
    icon: "shield-bug-outline",
    route: "SelectCropProtectionApplicationProductAndDate",
  },
  fertilizerApplication: {
    translationKey: "speed_dial.fertilizer_application",
    icon: "scatter-plot-outline",
    route: "SelectFertilizerAndDate",
  },
  cropRotation: {
    translationKey: "speed_dial.crop_rotation",
    icon: "grass",
    route: "SelectPlotsForPlan",
  },
  newAnimal: {
    translationKey: "speed_dial.new_animal",
    icon: "sheep",
    route: "CreateAnimal",
  },
  treatment: {
    translationKey: "speed_dial.treatment",
    icon: "needle",
    route: "CreateTreatment",
  },
} as const;

export const DEFAULT_SPEED_DIAL_ITEMS: SpeedDialActionConfig[] = [
  { id: "harvest", active: true },
  { id: "fertilizerApplication", active: true },
  { id: "newAnimal", active: true },
  { id: "treatment", active: true },
  { id: "tillage", active: false },
  { id: "cropProtection", active: false },
  { id: "cropRotation", active: false },
];
