import { RecurrencePicker, RecurrenceValue } from "./RecurrencePicker";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTheme } from "styled-components/native";

type RecurrencePickerModalProps = {
  visible: boolean;
  value: RecurrenceValue | null;
  onConfirm: (value: RecurrenceValue | null) => void;
  onClose: () => void;
};

export function RecurrencePickerModal({
  visible,
  value,
  onConfirm,
  onClose,
}: RecurrencePickerModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Draft state — only applied on Confirm
  const [draft, setDraft] = useState<RecurrenceValue | null>(value);

  // Re-sync draft when the modal opens; default to weekly/1 if no existing value
  useEffect(() => {
    if (visible) setDraft(value ?? { frequency: "weekly", interval: 1, until: null });
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {visible && (
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing.m,
          }}
          onPress={onClose}
        >
          <KeyboardAvoidingView behavior="padding" style={{ width: "100%", maxWidth: 360 }}>
            <Pressable
              style={{
                backgroundColor: theme.colors.white,
                borderRadius: 16,
                padding: theme.spacing.l,
                width: "100%",
                gap: theme.spacing.m,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: theme.colors.text }}>
                {t("tasks.recurrence")}
              </Text>

              <RecurrencePicker value={draft} onChange={setDraft} />

              <View style={{ flexDirection: "row", gap: theme.spacing.s }}>
                <Pressable
                  onPress={onClose}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    backgroundColor: theme.colors.gray5,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: theme.colors.gray1 }}>
                    {t("buttons.cancel")}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => { onConfirm(draft); onClose(); }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: theme.colors.white }}>
                    {t("buttons.confirm")}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      )}
    </Modal>
  );
}
