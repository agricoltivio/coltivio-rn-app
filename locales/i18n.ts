import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./en.json";
import it from "./it.json";
import de from "./de.json";
import fr from "./fr.json";

const defaultLocale = "de";
export const locale =
  Localization.getLocales()[0].languageCode || defaultLocale;

export const resources = {
  en: { translation: en },
  it: { translation: it },
  de: { translation: de },
  fr: { translation: fr },
} as const;

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  fallbackLng: defaultLocale,
  lng: locale,
  resources,
  interpolation: {
    escapeValue: false,
  },
  missingKeyHandler: (lng, ns, key) => key,
  returnEmptyString: false,
});

export default i18n;
