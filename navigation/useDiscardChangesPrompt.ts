import { usePreventRemove, useNavigation } from "@react-navigation/native";
import { useIsMutating } from "@tanstack/react-query";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

// Asks before leaving a screen (back button, swipe back, close) while it has unsaved changes.
// Leaving while a save or delete is running doesn't ask: the screens navigate away from their
// success callbacks, while the form is still "dirty". isSubmitting: for saves that don't run
// through a mutation. leaveWithoutPrompt: call it right before navigating away after a save that
// doesn't run through a mutation either (e.g. a form that hands its result back with popTo).
export function useDiscardChangesPrompt(
  hasUnsavedChanges: boolean,
  isSubmitting: boolean = false,
) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isMutating = useIsMutating() > 0;
  const leavingAfterSave = useRef(false);

  usePreventRemove(
    hasUnsavedChanges && !isMutating && !isSubmitting,
    ({ data }) => {
      if (leavingAfterSave.current) {
        navigation.dispatch(data.action);
        return;
      }
      Alert.alert(
        t("common.discard_changes_title"),
        t("common.discard_changes_message"),
        [
          { text: t("buttons.cancel"), style: "cancel" },
          {
            text: t("buttons.discard"),
            style: "destructive",
            onPress: () => navigation.dispatch(data.action),
          },
        ],
      );
    },
  );

  return {
    leaveWithoutPrompt: () => {
      leavingAfterSave.current = true;
    },
  };
}
