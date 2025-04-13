import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

type LocalSettingsData = {
  addPlotMapShowDrawingTip: boolean;
  addPlotMapShowParcelSelectTip: boolean;
  editPlotMapShowEditDrawingTipp: boolean;
  showSelectPlotsOrDrawTip: boolean;
  showSelectPlotsTip: boolean;
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
          setLocalSettings(JSON.parse(value));
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
