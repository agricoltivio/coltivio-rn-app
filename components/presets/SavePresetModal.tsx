import { Button } from "@/components/buttons/Button";
import { TextInput } from "@/components/inputs/TextInput";
import { Body, H3 } from "@/theme/Typography";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, View, Pressable } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useTheme } from "styled-components/native";

export type SavePresetModalRef = {
  open: () => void;
  close: () => void;
};

type SavePresetModalProps = {
  onSave: (name: string) => void;
  loading?: boolean;
};

export const SavePresetModal = forwardRef<SavePresetModalRef, SavePresetModalProps>(
  ({ onSave, loading }, ref) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [visible, setVisible] = useState(false);
    const [name, setName] = useState("");

    useImperativeHandle(ref, () => ({
      open: () => {
        setName("");
        setVisible(true);
      },
      close: () => setVisible(false),
    }));

    const handleSave = () => {
      if (name.trim()) {
        onSave(name.trim());
        setVisible(false);
        setName("");
      }
    };

    const handleCancel = () => {
      setVisible(false);
      setName("");
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            padding: theme.spacing.l,
          }}
          onPress={handleCancel}
        >
          <KeyboardAvoidingView behavior="padding">
          <Pressable
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 16,
              padding: theme.spacing.l,
              width: "100%",
              maxWidth: 400,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <H3 style={{ marginBottom: theme.spacing.m }}>
              {t("presets.save_as_preset")}
            </H3>

            <TextInput
              label={t("presets.preset_name")}
              value={name}
              onChangeText={setName}
              autoFocus
              placeholder={t("presets.enter_preset_name")}
            />

            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.m,
                marginTop: theme.spacing.l,
              }}
            >
              <Button
                title={t("buttons.cancel")}
                type="accent"
                onPress={handleCancel}
                style={{ flex: 1 }}
              />
              <Button
                title={t("buttons.save")}
                onPress={handleSave}
                loading={loading}
                disabled={!name.trim()}
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    );
  },
);
