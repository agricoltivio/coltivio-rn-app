import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { ReleaseNotesScreenProps } from "@/features/user/navigation/user-routes";
import { H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { ReleaseNotesMarkdown } from "./ReleaseNotesMarkdown";
import { getReleaseNoteText, RELEASE_NOTES } from "./release-notes";

export function ReleaseNotesScreen(_props: ReleaseNotesScreenProps) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  return (
    <ScrollView
      headerTitleOnScroll={t("release_notes.title")}
      showHeaderOnScroll
    >
      <ContentView>
        <H2>{t("release_notes.title")}</H2>
        {RELEASE_NOTES.map((note) => (
          <View key={note.version} style={{ marginTop: theme.spacing.l }}>
            <H3>
              {t("release_notes.version_heading", { version: note.version })}
            </H3>
            <ReleaseNotesMarkdown>
              {getReleaseNoteText(note, i18n.language)}
            </ReleaseNotesMarkdown>
          </View>
        ))}
      </ContentView>
    </ScrollView>
  );
}
