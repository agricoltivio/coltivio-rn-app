import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
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
  outdoorJournalOnboardingCompleted: boolean;
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

const defaultLocalSettings: LocalSettingsData = {
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
  outdoorJournalOnboardingCompleted: false,
};

export const LocalSettingsContext = createContext<LocalSettings>({
  localSettings: defaultLocalSettings,
  updateLocalSettings: () => {},
});

const localSettingsStorageKey = "localSettings";

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
            animalsGroups: mergeGroups(stored.animalsGroups ?? [], DEFAULT_ANIMALS_GROUPS),
            fieldCalendarGroups: mergeGroups(stored.fieldCalendarGroups ?? [], DEFAULT_FIELD_CALENDAR_GROUPS),
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
    setLocalSettings((prev) => ({ ...prev, [setting]: value }));
    AsyncStorage.setItem(
      localSettingsStorageKey,
      JSON.stringify({ ...localSettings, [setting]: value }),
    );
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
  const value = useContext(LocalSettingsContext);
  return value;
}
