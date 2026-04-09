import type { PermissionFeature } from "@/features/user/users.hooks";

export type AnimalsItemConfig = {
  itemId: string;
  visible: boolean;
};

export type AnimalsGroupConfig = {
  groupId: string;
  visible: boolean;
  items: AnimalsItemConfig[];
};

export type AnimalsItemMeta = {
  translationKey: string;
  route: string;
  feature: PermissionFeature;
  membershipRequired?: boolean;
};

// Maps itemId → translation key + navigation route + required permission feature
export const ANIMALS_ITEMS: Record<string, AnimalsItemMeta> = {
  animals: {
    translationKey: "animals.animals",
    route: "Animals",
    feature: "animals",
  },
  earTags: {
    translationKey: "ear_tags.ear_tags",
    route: "EarTags",
    feature: "animals",
  },
  drugs: { translationKey: "drugs.drugs", route: "Drugs", feature: "animals" },
  treatments: {
    translationKey: "treatments.treatments",
    route: "Treatments",
    feature: "animals",
  },
  tvdImport: {
    translationKey: "animals.tvd_import.title",
    route: "TvdImport",
    feature: "animals",
  },
  herds: {
    translationKey: "animals.herds",
    route: "Herds",
    feature: "animals",
  },
  outdoorJournal: {
    translationKey: "animals.outdoor_journal",
    route: "OutdoorJournal",
    feature: "animals",
    membershipRequired: true,
  },
};

// Maps groupId → translation key
export const ANIMALS_GROUPS = {
  animals: { translationKey: "animals.groups.animals" },
  health: { translationKey: "animals.groups.health" },
} as const;

export const DEFAULT_ANIMALS_GROUPS: AnimalsGroupConfig[] = [
  {
    groupId: "animals",
    visible: true,
    items: [
      { itemId: "animals", visible: true },
      { itemId: "earTags", visible: true },
      { itemId: "herds", visible: true },
      { itemId: "outdoorJournal", visible: true },
      { itemId: "tvdImport", visible: true },
    ],
  },
  {
    groupId: "health",
    visible: true,
    items: [
      { itemId: "drugs", visible: true },
      { itemId: "treatments", visible: true },
    ],
  },
];
