export type FieldCalendarItemConfig = {
  itemId: string;
  visible: boolean;
};

export type FieldCalendarGroupConfig = {
  groupId: string;
  visible: boolean;
  items: FieldCalendarItemConfig[];
};

// Maps itemId → translation key + navigation route
export const FIELD_CALENDAR_ITEMS = {
  cropFamilies: {
    translationKey: "field_calendar.crop_families",
    route: "CropFamilies",
  },
  crops: { translationKey: "field_calendar.crops", route: "Crops" },
  cropRotations: {
    translationKey: "field_calendar.crop_rotations",
    route: "CropRotations",
  },
  tillages: { translationKey: "field_calendar.tillages", route: "Tillages" },
  fertilizers: {
    translationKey: "field_calendar.fertilizers",
    route: "Fertilizers",
  },
  fertilizerApplications: {
    translationKey: "field_calendar.fertilizer_applications",
    route: "FertilizerApplications",
  },
  cropProtectionProducts: {
    translationKey: "field_calendar.crop_protection_products",
    route: "CropProtectionProducts",
  },
  cropProtectionApplications: {
    translationKey: "field_calendar.crop_protection_applications",
    route: "CropProtectionApplications",
  },
  harvests: { translationKey: "field_calendar.harvests", route: "Harvests" },
  fieldEventsMap: {
    translationKey: "field_calendar.field_events_map",
    route: "FieldEventsMap",
  },
} as const;

// Maps groupId → translation key
export const FIELD_CALENDAR_GROUPS = {
  crops: { translationKey: "field_calendar.groups.crops" },
  soil: { translationKey: "field_calendar.groups.soil" },
  fertilization: { translationKey: "field_calendar.groups.fertilization" },
  protection: { translationKey: "field_calendar.groups.protection" },
  harvest: { translationKey: "field_calendar.groups.harvest" },
  tools: { translationKey: "field_calendar.groups.tools" },
} as const;

export const DEFAULT_FIELD_CALENDAR_GROUPS: FieldCalendarGroupConfig[] = [
  {
    groupId: "crops",
    visible: true,
    items: [
      { itemId: "cropFamilies", visible: true },
      { itemId: "crops", visible: true },
      { itemId: "cropRotations", visible: true },
    ],
  },
  {
    groupId: "soil",
    visible: true,
    items: [{ itemId: "tillages", visible: true }],
  },
  {
    groupId: "fertilization",
    visible: true,
    items: [
      { itemId: "fertilizers", visible: true },
      { itemId: "fertilizerApplications", visible: true },
    ],
  },
  {
    groupId: "protection",
    visible: true,
    items: [
      { itemId: "cropProtectionProducts", visible: true },
      { itemId: "cropProtectionApplications", visible: true },
    ],
  },
  {
    groupId: "harvest",
    visible: true,
    items: [{ itemId: "harvests", visible: true }],
  },
  {
    groupId: "export",
    visible: true,
    items: [{ itemId: "export", visible: true }],
  },
  {
    groupId: "tools",
    visible: true,
    items: [{ itemId: "fieldEventsMap", visible: true }],
  },
];
