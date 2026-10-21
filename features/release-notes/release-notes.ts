import { AppLocale } from "@/locales/i18n";
import { compareVersions } from "@/utils/version";

export type ReleaseNote = {
  version: string;
  // Markdown per language, rendered with WikiMarkdown
  notes: Record<AppLocale, string>;
};

// Complete release history of the app, newest first. Shown once in the
// "What's new" sheet after an update and anytime under Settings.
//
// Release process:
//   1. `yarn release:prepare` bumps the version in app.config.js and adds a
//      template entry below the marker line. Fill in all four languages.
//   2. Build and submit with EAS as usual.
//   3. In coltivio-api, `yarn release:app <version>` records the release; once
//      the store rollout is live, apply that migration to prod so older
//      installs get the update banner.
export const RELEASE_NOTES: ReleaseNote[] = [
  // release:prepare inserts new entries below this line
  {
    version: "1.0.7",
    notes: {
      de: `- Die App zeigt neu ihre Version in den Einstellungen.
- Hinweis auf der Startseite, sobald eine neuere Version im Store verfügbar ist.
- Nach einem Update erscheint einmalig, was neu ist.`,
      fr: `- L'application affiche désormais sa version dans les paramètres.
- Un message sur la page d'accueil signale une nouvelle version disponible dans le store.
- Après une mise à jour, les nouveautés s'affichent une fois.`,
      it: `- L'app mostra ora la sua versione nelle impostazioni.
- Un avviso nella pagina iniziale segnala quando è disponibile una nuova versione nello store.
- Dopo un aggiornamento, le novità vengono mostrate una volta.`,
      en: `- The app now shows its version in the settings.
- A notice on the home screen appears once a newer version is available in the store.
- After an update, what's new is shown once.`,
    },
  },
];

// Entries newer than lastSeen and not newer than current, newest first.
// lastSeen null means every entry up to current.
export function getReleaseNotesBetween(
  lastSeen: string | null,
  current: string,
): ReleaseNote[] {
  return RELEASE_NOTES.filter(
    (note) =>
      compareVersions(note.version, current) <= 0 &&
      (lastSeen === null || compareVersions(note.version, lastSeen) > 0),
  );
}

export function getReleaseNoteText(note: ReleaseNote, locale: string) {
  return note.notes[locale as AppLocale] ?? note.notes.de;
}
