export type HomeTileConfig = {
  id: string;
  visible: boolean;
};

export type HomeTileMeta = {
  translationKey: string;
  route: string;
  image: number;
  routeParams?: Record<string, never>;
  membershipRequired?: boolean;
};

export const HOME_TILES = {
  farm: {
    translationKey: "home.tiles.farm",
    route: "Farm",
    image: require("@/assets/images/farm-icon-6.png"),
  },
  plots: {
    translationKey: "home.tiles.plots",
    route: "PlotsMap",
    image: require("@/assets/images/field-calendar-icon-4.png"),
    routeParams: {} as Record<string, never>,
  },
  animalHusbandry: {
    translationKey: "home.tiles.animal_husbandry",
    route: "AnimalsHub",
    image: require("@/assets/images/animals-icon.png"),
  },
  fieldCalendar: {
    translationKey: "home.tiles.field_calendar",
    route: "FieldCalendar",
    image: require("@/assets/images/harvest-icon.png"),
  },
  wiki: {
    translationKey: "home.tiles.wiki",
    route: "WikiList",
    image: require("@/assets/images/wiki.png"),
  },
  tasks: {
    translationKey: "home.tiles.tasks",
    route: "TaskList",
    image: require("@/assets/images/tasks.png"),
    membershipRequired: true,
  },
} as const;

export const DEFAULT_HOME_TILES: HomeTileConfig[] = [
  { id: "farm", visible: true },
  { id: "plots", visible: true },
  { id: "animalHusbandry", visible: true },
  { id: "fieldCalendar", visible: true },
  { id: "wiki", visible: true },
  { id: "tasks", visible: true },
];
