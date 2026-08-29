import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AnimalsGroupConfig,
  DEFAULT_ANIMALS_GROUPS,
} from "../animals/animals-settings";
import {
  DEFAULT_FIELD_CALENDAR_GROUPS,
  FieldCalendarGroupConfig,
} from "../field-calendar/field-calendar-settings";
import {
  DEFAULT_HOME_TILES,
  HomeTileConfig,
} from "../home/home-tiles-settings";
import {
  DEFAULT_SPEED_DIAL_ITEMS,
  SpeedDialActionConfig,
} from "../home/speed-dial-settings";
import { AppLocale, applyAppLocale } from "@/locales/i18n";
type LocalSettingsData = {
  editPlotOnboardingCompleted: boolean;
  fieldCalendarGroups: FieldCalendarGroupConfig[];
  fieldCalendarOnboardingCompleted: boolean;
  animalsGroups: AnimalsGroupConfig[];
  animalsOnboardingCompleted: boolean;
  mapDrawOnboardingCompleted: boolean;
  addPlotDrawOnboardingCompleted: boolean;
  addPlotParcelOnboardingCompleted: boolean;
  selectPlotsForPlanOnboardingCompleted: boolean;
  plotsMapOnboardingCompleted: boolean;
  splitPlotOnboardingCompleted: boolean;
  mergePlotsOnboardingCompleted: boolean;
  herdsOnboardingCompleted: boolean;
  tvdImportOnboardingCompleted: boolean;
  onboardingsDisabled: boolean;
  speedDialEnabled: boolean;
  speedDialOnboardingCompleted: boolean;
  speedDialItems: SpeedDialActionConfig[];
  homeTiles: HomeTileConfig[];
  homeTilesLayout: "grid" | "list";
  showUpcomingTasks: boolean;
  wikiOnlyPrivate: boolean;
  wikiOnboardingCompleted: boolean;
  // Maps CR id → last seen status, used to detect unseen activity on submissions
  wikiSeenCrStatuses: Record<string, string>;
  tasksOnboardingCompleted: boolean;
  // Stores the ISO date string of the expiry date the membership banner was dismissed for.
  // When a new subscription period starts (new date), the banner reappears automatically.
  dismissedMembershipBannerForDate: string | null;
  // ISO date string of the very first time the app was opened (set once, never updated).
  firstLaunchDate: string | null;
  // Whether the AgriColtivio membership promo modal has been shown and dismissed.
  agriColtivioPromoShown: boolean;
  defaultMapLayer: "satellite" | "map";
  defaultPlotColorMode: "plot" | "crop" | "usage" | "cutting";
  // Manually chosen app language. null = never chosen, so the app follows the
  // device language (only the initial state, never shown as a UI option).
  preferredLocale: AppLocale | null;
};

type LocalSettingActions = {
  updateLocalSettings: <K extends keyof LocalSettingsData>(
    setting: K,
    value: LocalSettingsData[K],
  ) => void;
};

type LocalSettings = {
  localSettings: LocalSettingsData;
} & LocalSettingActions;

export const defaultLocalSettings: LocalSettingsData = {
  editPlotOnboardingCompleted: false,
  fieldCalendarGroups: DEFAULT_FIELD_CALENDAR_GROUPS,
  fieldCalendarOnboardingCompleted: false,
  animalsGroups: DEFAULT_ANIMALS_GROUPS,
  animalsOnboardingCompleted: false,
  mapDrawOnboardingCompleted: false,
  addPlotDrawOnboardingCompleted: false,
  addPlotParcelOnboardingCompleted: false,
  selectPlotsForPlanOnboardingCompleted: false,
  plotsMapOnboardingCompleted: false,
  splitPlotOnboardingCompleted: false,
  mergePlotsOnboardingCompleted: false,
  herdsOnboardingCompleted: false,
  tvdImportOnboardingCompleted: false,
  onboardingsDisabled: false,
  speedDialEnabled: true,
  speedDialOnboardingCompleted: false,
  speedDialItems: DEFAULT_SPEED_DIAL_ITEMS,
  homeTiles: DEFAULT_HOME_TILES,
  homeTilesLayout: "list",
  showUpcomingTasks: true,
  wikiOnlyPrivate: false,
  wikiOnboardingCompleted: false,
  wikiSeenCrStatuses: {},
  tasksOnboardingCompleted: false,
  dismissedMembershipBannerForDate: null,
  firstLaunchDate: null,
  agriColtivioPromoShown: false,
  defaultMapLayer: "satellite",
  defaultPlotColorMode: "crop",
  preferredLocale: null,
};

export const LocalSettingsContext = createContext<LocalSettings>({
  localSettings: defaultLocalSettings,
  updateLocalSettings: () => {},
});

const localSettingsStorageKey = "localSettings";

// Preserves stored order, appends new tile configs not yet in storage
function mergeHomeTiles(
  stored: HomeTileConfig[],
  defaults: HomeTileConfig[],
): HomeTileConfig[] {
  const storedIds = new Set(stored.map((i) => i.id));
  const newItems = defaults.filter((i) => !storedIds.has(i.id));
  return [...stored, ...newItems];
}

// Preserves stored order, appends new items not yet in storage
function mergeSpeedDialItems(
  stored: SpeedDialActionConfig[],
  defaults: SpeedDialActionConfig[],
): SpeedDialActionConfig[] {
  const storedIds = new Set(stored.map((i) => i.id));
  const newItems = defaults.filter((i) => !storedIds.has(i.id));
  return [...stored, ...newItems];
}

// One-time migration: the field calendar used to split Bodenbearbeitung/Düngung/
// Pflanzenschutz/Ernte into four separate groups ("soil", "fertilization",
// "protection", "harvest"). They were consolidated into a single "measures" group
// (plus a new "resources" group for the product items that used to live alongside
// them). This carries over each item's stored visibility into the new groups so
// existing installs don't lose their customization when the old groupIds vanish
// from FIELD_CALENDAR_GROUPS.
function migrateFieldCalendarGroups(
  stored: FieldCalendarGroupConfig[],
): FieldCalendarGroupConfig[] {
  const oldGroupIds = ["soil", "fertilization", "protection", "harvest"];
  const oldGroupIndex = stored.findIndex((g) =>
    oldGroupIds.includes(g.groupId),
  );
  if (oldGroupIndex === -1) {
    return stored;
  }

  const itemVisibility = new Map<string, boolean>();
  for (const group of stored) {
    if (oldGroupIds.includes(group.groupId)) {
      for (const item of group.items) {
        itemVisibility.set(item.itemId, item.visible);
      }
    }
  }

  function buildGroup(
    groupId: string,
    itemIds: string[],
  ): FieldCalendarGroupConfig {
    return {
      groupId,
      visible: true,
      items: itemIds
        .filter((itemId) => itemVisibility.has(itemId))
        .map((itemId) => ({ itemId, visible: itemVisibility.get(itemId)! })),
    };
  }
  const measures = buildGroup("measures", [
    "tillages",
    "fertilizerApplications",
    "cropProtectionApplications",
    "harvests",
  ]);
  const resources = buildGroup("resources", [
    "fertilizers",
    "cropProtectionProducts",
  ]);

  const rest = stored.filter((g) => !oldGroupIds.includes(g.groupId));
  // Re-insert the consolidated groups at the position the old groups used to occupy,
  // so their placement relative to "crops"/"tools" stays where the user left it.
  const restIndex = stored
    .slice(0, oldGroupIndex)
    .filter((g) => !oldGroupIds.includes(g.groupId)).length;
  return [
    ...rest.slice(0, restIndex),
    measures,
    resources,
    ...rest.slice(restIndex),
  ];
}

// Preserves stored order and visibility, appends new defaults not yet in storage
function mergeGroups(
  stored: AnimalsGroupConfig[] | FieldCalendarGroupConfig[],
  defaults: AnimalsGroupConfig[] | FieldCalendarGroupConfig[],
) {
  const defaultMap = new Map(defaults.map((g) => [g.groupId, g]));
  // Start from stored order, injecting any new default items into each group
  const merged = stored.map((saved) => {
    const def = defaultMap.get(saved.groupId);
    if (!def) return saved;
    const savedItemIds = new Set(saved.items.map((i) => i.itemId));
    const newItems = def.items.filter((i) => !savedItemIds.has(i.itemId));
    return { ...saved, items: [...saved.items, ...newItems] };
  });
  // Append any entirely new groups not yet in storage
  const storedIds = new Set(stored.map((g) => g.groupId));
  const newGroups = defaults.filter((g) => !storedIds.has(g.groupId));
  return [...merged, ...newGroups];
}

export function LocalSettingsProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [localSettings, setLocalSettings] =
    useState<LocalSettingsData>(defaultLocalSettings);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(localSettingsStorageKey).then((value) => {
      if (isMounted) {
        setLoading(false);
        if (value) {
          const stored = JSON.parse(value);
          setLocalSettings({
            ...defaultLocalSettings,
            ...stored,
            animalsGroups: mergeGroups(
              stored.animalsGroups ?? [],
              DEFAULT_ANIMALS_GROUPS,
            ),
            fieldCalendarGroups: mergeGroups(
              migrateFieldCalendarGroups(stored.fieldCalendarGroups ?? []),
              DEFAULT_FIELD_CALENDAR_GROUPS,
            ),
            speedDialItems: mergeSpeedDialItems(
              stored.speedDialItems ?? [],
              DEFAULT_SPEED_DIAL_ITEMS,
            ),
            homeTiles: mergeHomeTiles(
              stored.homeTiles ?? [],
              DEFAULT_HOME_TILES,
            ),
          });
          applyAppLocale(stored.preferredLocale);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function updateLocalSettings<K extends keyof LocalSettingsData>(
    setting: K,
    value: LocalSettingsData[K],
  ) {
    setLocalSettings((prev) => {
      const next = { ...prev, [setting]: value };
      AsyncStorage.setItem(localSettingsStorageKey, JSON.stringify(next));
      return next;
    });
  }

  return (
    <LocalSettingsContext.Provider
      value={{ localSettings: localSettings, updateLocalSettings }}
    >
      {!loading ? children : null}
    </LocalSettingsContext.Provider>
  );
}

export function useLocalSettings() {
  const { localSettings, updateLocalSettings } =
    useContext(LocalSettingsContext);

  // When onboardingsDisabled is true, all onboarding flags appear as completed
  // without overwriting the real stored values
  const effectiveSettings = useMemo(() => {
    if (!localSettings.onboardingsDisabled) return localSettings;
    return {
      ...localSettings,
      editPlotOnboardingCompleted: true,
      fieldCalendarOnboardingCompleted: true,
      animalsOnboardingCompleted: true,
      mapDrawOnboardingCompleted: true,
      addPlotDrawOnboardingCompleted: true,
      addPlotParcelOnboardingCompleted: true,
      selectPlotsForPlanOnboardingCompleted: true,
      plotsMapOnboardingCompleted: true,
      splitPlotOnboardingCompleted: true,
      mergePlotsOnboardingCompleted: true,
      herdsOnboardingCompleted: true,
      tvdImportOnboardingCompleted: true,
      speedDialOnboardingCompleted: true,
    };
  }, [localSettings]);

  return { localSettings: effectiveSettings, updateLocalSettings };
}
