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
              stored.fieldCalendarGroups ?? [],
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
