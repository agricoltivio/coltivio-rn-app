import { BottomDrawerModal } from "@/components/bottom-drawer/BottomDrawerModal";
import { Button } from "@/components/buttons/Button";
import { useActiveFarm } from "@/features/farms/ActiveFarmContext";
import { useLocalSettings } from "@/features/user/LocalSettingsContext";
import { H2, H3 } from "@/theme/Typography";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { ReleaseNotesMarkdown } from "./ReleaseNotesMarkdown";
import { getReleaseNoteText } from "./release-notes";
import { usePendingReleaseNotes } from "./usePendingReleaseNotes";

// Shows the release notes once after an update. Self-contained like
// FarmCreatedModal: mount it on the home screen and it decides itself.
export function WhatsNewSheet() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const { activeFarmId } = useActiveFarm();
  const { localSettings } = useLocalSettings();
  const { pending, lastSeenVersion, currentVersion, markSeen } =
    usePendingReleaseNotes();
  const sheetRef = useRef<BottomSheetModal>(null);

  // A native Modal always stacks above the sheet, so wait until the
  // "farm set up" modal is gone.
  const farmCreatedModalPending =
    activeFarmId !== null &&
    localSettings.farmCreatedModalPendingFarmIds.includes(activeFarmId);
  const visible = pending.length > 0 && !farmCreatedModalPending;

  useEffect(() => {
    if (visible) {
      // Presenting straight on mount races the navigator's own transition
      const frame = requestAnimationFrame(() => sheetRef.current?.present());
      return () => cancelAnimationFrame(frame);
    }
  }, [visible]);

  // Catch up silently when a release shipped without notes
  useEffect(() => {
    if (pending.length === 0 && lastSeenVersion !== currentVersion) {
      markSeen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.length, lastSeenVersion, currentVersion]);

  if (pending.length === 0) {
    return null;
  }

  return (
    <BottomSheetModalProvider>
      <BottomDrawerModal ref={sheetRef} onClose={markSeen} snapPoints={["75%"]}>
        <H2>{t("release_notes.title")}</H2>
        {pending.map((note) => (
          <View key={note.version} style={{ marginTop: theme.spacing.m }}>
            <H3>
              {t("release_notes.version_heading", { version: note.version })}
            </H3>
            <ReleaseNotesMarkdown>
              {getReleaseNoteText(note, i18n.language)}
            </ReleaseNotesMarkdown>
          </View>
        ))}
        <Button
          style={{ marginTop: theme.spacing.l }}
          title={t("release_notes.close")}
          onPress={() => sheetRef.current?.dismiss()}
        />
      </BottomDrawerModal>
    </BottomSheetModalProvider>
  );
}
