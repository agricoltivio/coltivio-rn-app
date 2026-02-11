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
  addPlotMapShowDrawingTip: boolean;
  addPlotMapShowParcelSelectTip: boolean;
  editPlotMapShowEditDrawingTipp: boolean;
  showSelectPlotsOrDrawTip: boolean;
  showSelectPlotsTip: boolean;
  fieldCalendarGroups: FieldCalendarGroupConfig[];
  fieldCalendarOnboardingCompleted: boolean;
  animalsGroups: AnimalsGroupConfig[];
  animalsOnboardingCompleted: boolean;
  mapDrawOnboardingCompleted: boolean;
};

type LocalSettingActions = {
  updateLocalSettings: <K extends keyof LocalSettingsData>(
    setting: K,
    value: LocalSettingsData[K]
  ) => void;
};

type LocalSettings = {
  localSettings: LocalSettingsData;
} & LocalSettingActions;

const defaultLocalSettings: LocalSettingsData = {
  addPlotMapShowDrawingTip: true,
  addPlotMapShowParcelSelectTip: true,
  editPlotMapShowEditDrawingTipp: true,
  showSelectPlotsOrDrawTip: true,
  showSelectPlotsTip: true,
  fieldCalendarGroups: DEFAULT_FIELD_CALENDAR_GROUPS,
  fieldCalendarOnboardingCompleted: false,
  animalsGroups: DEFAULT_ANIMALS_GROUPS,
  animalsOnboardingCompleted: false,
  mapDrawOnboardingCompleted: false,
};

export const LocalSettingsContext = createContext<LocalSettings>({
  localSettings: defaultLocalSettings,
  updateLocalSettings: () => {},
});

const localSettingsStorageKey = "localSettings";

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
          setLocalSettings({ ...defaultLocalSettings, ...JSON.parse(value) });
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  function updateLocalSettings<K extends keyof LocalSettingsData>(
    setting: K,
    value: LocalSettingsData[K]
  ) {
    setLocalSettings((prev) => ({ ...prev, [setting]: value }));
    AsyncStorage.setItem(
      localSettingsStorageKey,
      JSON.stringify({ ...localSettings, [setting]: value })
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
