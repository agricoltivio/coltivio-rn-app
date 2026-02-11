export type AnimalsItemConfig = {
  itemId: string;
  visible: boolean;
};

export type AnimalsGroupConfig = {
  groupId: string;
  visible: boolean;
  items: AnimalsItemConfig[];
};

// Maps itemId → translation key + navigation route
export const ANIMALS_ITEMS = {
  animals: { translationKey: "animals.animals", route: "Animals" },
  earTags: { translationKey: "ear_tags.ear_tags", route: "EarTags" },
  drugs: { translationKey: "drugs.drugs", route: "Drugs" },
  treatments: {
    translationKey: "treatments.treatments",
    route: "Treatments",
  },
  tvdImport: { translationKey: "animals.tvd_import.title", route: "TvdImport" },
  herds: { translationKey: "animals.herds", route: "Herds" },
} as const;

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
