import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./en.json";
import it from "./it.json";
import de from "./de.json";
import fr from "./fr.json";

const defaultLocale = "de";

export type AppLocale = "de" | "fr" | "it" | "en";
const supportedLocales: AppLocale[] = ["de", "fr", "it", "en"];

// Reads the device language, clamped to the languages we support. Falls back to
// German for anything else. Used as the initial language and as the fallback
// when no language has been picked manually yet.
export function getDeviceLocale(): AppLocale {
  const code = Localization.getLocales()[0]?.languageCode;
  return supportedLocales.includes(code as AppLocale)
    ? (code as AppLocale)
    : defaultLocale;
}

export const resources = {
  en: { translation: en },
  it: { translation: it },
  de: { translation: de },
  fr: { translation: fr },
} as const;

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  fallbackLng: defaultLocale,
  lng: getDeviceLocale(),
  resources,
  interpolation: {
    escapeValue: false,
  },
  missingKeyHandler: (lng, ns, key) => key,
  returnEmptyString: false,
});

// Live-binding mirror of the active language. ES module named exports are live
// bindings, so every `import { locale }` consumer (mostly date/number
// formatting) reads the current value on each render and follows a manual
// language switch without per-file changes. Starts at the device locale and
// updates whenever i18n.changeLanguage runs (see LanguageSettingsScreen).
export let locale: string = i18n.language ?? getDeviceLocale();
i18n.on("languageChanged", (lng) => {
  locale = lng;
});

export default i18n;
