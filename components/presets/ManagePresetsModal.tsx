import { MaterialIcons } from "@expo/vector-icons";
import { forwardRef, useImperativeHandle, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components/native";
import { TextInput } from "../inputs/TextInput";
import { Body, H3 } from "@/theme/Typography";
import { Button } from "../buttons/Button";

export type ManagePresetsModalRef = {
  open: () => void;
  close: () => void;
};

type PresetItem = {
  id: string;
  name: string;
};

type ManagePresetsModalProps = {
  presets: PresetItem[];
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  title?: string;
};

export const ManagePresetsModal = forwardRef<
  ManagePresetsModalRef,
  ManagePresetsModalProps
>(({ presets, onRename, onDelete, title }, ref) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));

  const handleStartEdit = (preset: PresetItem) => {
    setEditingId(preset.id);
    setEditName(preset.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onRename(editingId, editName.trim());
      setEditingId(null);
      setEditName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleDelete = (preset: PresetItem) => {
    Alert.alert(
      t("presets.delete_confirm_title"),
      t("presets.delete_confirm_message", { name: preset.name }),
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("buttons.delete"),
          style: "destructive",
          onPress: () => onDelete(preset.id),
        },
      ],
    );
  };

  const handleClose = () => {
    setVisible(false);
    setEditingId(null);
    setEditName("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: theme.spacing.l,
        }}
        onPress={handleClose}
      >
        <Pressable
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 16,
            padding: theme.spacing.l,
            width: "100%",
            maxWidth: 400,
            maxHeight: "80%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <H3 style={{ marginBottom: theme.spacing.m }}>
            {title ?? t("presets.manage_presets")}
          </H3>

          <ScrollView
            style={{ flexGrow: 0 }}
            showsVerticalScrollIndicator={false}
          >
            {presets.length === 0 ? (
              <Body
                style={{
                  color: theme.colors.gray1,
                  textAlign: "center",
                  paddingVertical: theme.spacing.l,
                }}
              >
                {t("presets.no_presets")}
              </Body>
            ) : (
              <View style={{ gap: theme.spacing.s }}>
                {presets.map((preset) => (
                  <View
                    key={preset.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: theme.colors.gray4,
                      borderRadius: 10,
                      padding: theme.spacing.s,
                    }}
                  >
                    {editingId === preset.id ? (
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: theme.spacing.s,
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <TextInput
                            value={editName}
                            onChangeText={setEditName}
                            hideLabel
                            autoFocus
                          />
                        </View>
                        <TouchableOpacity onPress={handleSaveEdit}>
                          <MaterialIcons
                            name="check"
                            size={24}
                            color={theme.colors.success}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCancelEdit}>
                          <MaterialIcons
                            name="close"
                            size={24}
                            color={theme.colors.gray1}
                          />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <>
                        <Body style={{ flex: 1 }}>{preset.name}</Body>
                        <TouchableOpacity
                          onPress={() => handleStartEdit(preset)}
                          style={{ padding: theme.spacing.xs }}
                        >
                          <MaterialIcons
                            name="edit"
                            size={20}
                            color={theme.colors.gray1}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDelete(preset)}
                          style={{ padding: theme.spacing.xs }}
                        >
                          <MaterialIcons
                            name="delete"
                            size={20}
                            color={theme.colors.danger}
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <Button
            title={t("buttons.close")}
            type="accent"
            style={{ marginTop: theme.spacing.l }}
            onPress={handleClose}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
});
