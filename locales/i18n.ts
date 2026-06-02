import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./en.json";
import it from "./it.json";
import de from "./de.json";
import fr from "./fr.json";

export type AppLocale = "de" | "fr" | "it" | "en";

const defaultLocale: AppLocale = "de";
const supportedLocales: AppLocale[] = ["de", "fr", "it", "en"];

// Clamps to a supported language so i18n.language is always one of ours,
// which the settings highlight and the Accept-Language header rely on.
function resolveDeviceLocale(): AppLocale {
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
  lng: resolveDeviceLocale(),
  resources,
  interpolation: {
    escapeValue: false,
  },
  missingKeyHandler: (lng, ns, key) => key,
  returnEmptyString: false,
});

// Applies the stored language choice, or follows the device when unset.
export function applyAppLocale(preferred: AppLocale | null) {
  i18n.changeLanguage(preferred ?? resolveDeviceLocale());
}

export default i18n;
