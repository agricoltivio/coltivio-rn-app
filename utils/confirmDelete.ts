import i18n from "@/locales/i18n";
import { Alert } from "react-native";

// Asks before deleting. message: what gets lost, when more than the default "can't be undone"
export function confirmDelete(onConfirm: () => void, message?: string) {
  Alert.alert(
    i18n.t("common.delete_confirm_title"),
    message ?? i18n.t("common.delete_confirm_message"),
    [
      { text: i18n.t("buttons.cancel"), style: "cancel" },
      {
        text: i18n.t("buttons.delete"),
        style: "destructive",
        onPress: onConfirm,
      },
    ],
  );
}
