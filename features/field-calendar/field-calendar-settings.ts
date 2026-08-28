import type { PermissionFeature } from "@/features/user/users.hooks";

export type FieldCalendarItemConfig = {
  itemId: string;
  visible: boolean;
};

export type FieldCalendarGroupConfig = {
  groupId: string;
  visible: boolean;
  items: FieldCalendarItemConfig[];
};

export type FieldCalendarItemMeta = {
  translationKey: string;
  route: string;
  feature: PermissionFeature;
};

// Maps itemId → translation key + navigation route + required permission feature
export const FIELD_CALENDAR_ITEMS: Record<string, FieldCalendarItemMeta> = {
  cropFamilies: {
    translationKey: "field_calendar.crop_families",
    route: "CropFamilies",
    feature: "field_calendar",
  },
  crops: {
    translationKey: "field_calendar.crops",
    route: "Crops",
    feature: "field_calendar",
  },
  cropRotations: {
    translationKey: "field_calendar.crop_rotations",
    route: "CropRotations",
    feature: "field_calendar",
  },
  tillages: {
    translationKey: "field_calendar.tillages",
    route: "Tillages",
    feature: "field_calendar",
  },
  fertilizers: {
    translationKey: "field_calendar.fertilizers",
    route: "Fertilizers",
    feature: "field_calendar",
  },
  fertilizerApplications: {
    translationKey: "field_calendar.fertilizer_applications",
    route: "FertilizerApplications",
    feature: "field_calendar",
  },
  cropProtectionProducts: {
    translationKey: "field_calendar.crop_protection_products",
    route: "CropProtectionProducts",
    feature: "field_calendar",
  },
  cropProtectionApplications: {
    translationKey: "field_calendar.crop_protection_applications",
    route: "CropProtectionApplications",
    feature: "field_calendar",
  },
  harvests: {
    translationKey: "field_calendar.harvests",
    route: "Harvests",
    feature: "field_calendar",
  },
  fieldEventsMap: {
    translationKey: "field_calendar.field_events_map",
    route: "FieldEventsMap",
    feature: "field_calendar",
  },
  export: {
    translationKey: "field_calendar.export",
    route: "FieldCalendarExport",
    feature: "field_calendar",
  },
};

// Maps groupId → translation key
export const FIELD_CALENDAR_GROUPS = {
  crops: { translationKey: "field_calendar.groups.crops" },
  measures: { translationKey: "field_calendar.groups.measures" },
  resources: { translationKey: "field_calendar.groups.resources" },
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
    groupId: "measures",
    visible: true,
    items: [
      { itemId: "tillages", visible: true },
      { itemId: "fertilizerApplications", visible: true },
      { itemId: "cropProtectionApplications", visible: true },
      { itemId: "harvests", visible: true },
    ],
  },
  {
    groupId: "resources",
    visible: true,
    items: [
      { itemId: "fertilizers", visible: true },
      { itemId: "cropProtectionProducts", visible: true },
    ],
  },
  {
    groupId: "tools",
    visible: true,
    items: [
      { itemId: "fieldEventsMap", visible: true },
      { itemId: "export", visible: true },
    ],
  },
];
