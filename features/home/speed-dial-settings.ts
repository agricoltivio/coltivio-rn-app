export type SpeedDialActionConfig = {
  id: string;
  active: boolean;
};

export const SPEED_DIAL_ACTIONS = {
  harvest: {
    translationKey: "speed_dial.harvest",
    icon: "fruit-cherries",
    route: "SelectHarvestCropAndDate",
    accessFeature: "field_calendar" as const,
  },
  tillage: {
    translationKey: "speed_dial.tillage",
    icon: "shovel",
    route: "SelectTillageDate",
    accessFeature: "field_calendar" as const,
  },
  cropProtection: {
    translationKey: "speed_dial.crop_protection",
    icon: "shield-bug-outline",
    route: "SelectCropProtectionApplicationProductAndDate",
    accessFeature: "field_calendar" as const,
  },
  fertilizerApplication: {
    translationKey: "speed_dial.fertilizer_application",
    icon: "scatter-plot-outline",
    route: "SelectFertilizerAndDate",
    accessFeature: "field_calendar" as const,
  },
  cropRotation: {
    translationKey: "speed_dial.crop_rotation",
    icon: "grass",
    route: "SelectPlotsForPlan",
    accessFeature: "field_calendar" as const,
  },
  newAnimal: {
    translationKey: "speed_dial.new_animal",
    icon: "sheep",
    route: "CreateAnimal",
    accessFeature: "animals" as const,
  },
  treatment: {
    translationKey: "speed_dial.treatment",
    icon: "needle",
    route: "CreateTreatment",
    accessFeature: "animals" as const,
  },
  newTask: {
    translationKey: "speed_dial.new_task",
    icon: "clipboard-check-outline",
    route: "TaskForm",
    accessFeature: "tasks" as const,
    membershipRequired: true,
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
  { id: "newTask", active: false },
];
