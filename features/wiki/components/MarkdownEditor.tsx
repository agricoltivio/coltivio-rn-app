import {
  DEFAULT_TOOLBAR_ITEMS,
  RichText,
  Toolbar,
  useEditorBridge,
  useEditorContent,
  type ToolbarItem,
} from "@10play/tentap-editor";
import { useApi } from "@/api/api";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { marked } from "marked";
import { NodeHtmlMarkdown } from "node-html-markdown";
import { useMembership } from "@/features/farms/farms.hooks";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { WikiMarkdown } from "@/features/wiki/components/WikiMarkdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled from "styled-components/native";

const nhm = new NodeHtmlMarkdown();

// When running against a local Supabase, the backend returns URLs with localhost/127.0.0.1
// which the phone can't reach. Replace with the LAN IP from the Expo Metro bundler host.
function resolveLocalUrl(url: string): string {
  const lanIp = Constants.expoConfig?.hostUri?.split(":").shift();
  if (!lanIp) return url;
  return url.replace(/localhost|127\.0\.0\.1/g, lanIp);
}

function markdownToHtml(markdown: string): string {
  const result = marked(markdown || " ");
  return result instanceof Promise ? "" : result;
}

type Props = {
  value: string;
  onChange: (markdown: string) => void;
  label?: string;
  entryId: string;
  readOnly?: boolean;
};

export function MarkdownEditor({ value, onChange, label, entryId, readOnly }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isActive } = useMembership();

  if (readOnly) {
    return (
      <View>
        {label && <Label>{label}</Label>}
        <View style={styles.preview}>
          {value ? <WikiMarkdown>{value}</WikiMarkdown> : <PreviewText>…</PreviewText>}
        </View>
      </View>
    );
  }

  return (
    <View>
      {label && <Label>{label}</Label>}
      <TouchableOpacity style={styles.preview} onPress={() => setIsOpen(true)}>
        <View style={styles.previewContent}>
          {value ? (
            <WikiMarkdown>{value}</WikiMarkdown>
          ) : (
            <PreviewText>…</PreviewText>
          )}
        </View>
        <Ionicons name="pencil-outline" size={18} color="#666" />
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide">
        <View style={[styles.fullScreen, { paddingTop: insets.top }]}>
          {isOpen && (
            <EditorContent
              value={value}
              onChange={onChange}
              entryId={entryId}
              onClose={() => setIsOpen(false)}
              closeLabel={t("buttons.close")}
              showImageUpload={isActive}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

type EditorContentProps = {
  value: string;
  onChange: (markdown: string) => void;
  entryId: string;
  onClose: () => void;
  closeLabel: string;
  showImageUpload: boolean;
};

function EditorContent({ value, onChange, entryId, onClose, closeLabel, showImageUpload }: EditorContentProps) {
  const api = useApi();
  const isFirstRender = useRef(true);

  const editor = useEditorBridge({
    initialContent: markdownToHtml(value),
    autofocus: true,
    avoidIosKeyboard: true,
  });

  const htmlContent = useEditorContent(editor, {
    type: "html",
    debounceInterval: 300,
  });

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (htmlContent !== undefined) {
      onChange(nhm.translate(htmlContent));
    }
  }, [htmlContent]);

  const imageToolbarItem: ToolbarItem = {
    onPress:
      ({ editor: e }) =>
      async () => {
        try {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
          });
          if (result.canceled || !result.assets[0]) return;

          const asset = result.assets[0];
          const filename = asset.fileName ?? `image_${Date.now()}`;

          const { signedUrl, path } = await api.wiki.getImageSignedUrl(entryId, filename);

          const fileResponse = await fetch(asset.uri);
          const blob = await fileResponse.blob();
          await fetch(resolveLocalUrl(signedUrl), { method: "PUT", body: blob });

          const { publicUrl } = await api.wiki.registerImage(entryId, path);

          e.setImage(resolveLocalUrl(publicUrl));
          // Insert a paragraph after the image so the cursor has somewhere to go
          setTimeout(() => {
            editor.webviewRef.current?.injectJavaScript(
              `window.editor.chain().focus('end').createParagraphNear().run(); true;`
            );
          }, 50);
        } catch {
          Alert.alert("Fehler", "Bild konnte nicht hochgeladen werden.");
        }
      },
    active: () => false,
    disabled: () => false,
    image: () => require("@/assets/icons/photo.png"),
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <CloseText>{closeLabel}</CloseText>
        </TouchableOpacity>
      </View>
      <RichText editor={editor} style={styles.editor} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardAvoidingView}
      >
        <Toolbar editor={editor} items={
          showImageUpload
            ? [
                // Remove code (5) and strikethrough (7), insert image at position 5
                ...DEFAULT_TOOLBAR_ITEMS.slice(0, 5),
                imageToolbarItem,
                ...DEFAULT_TOOLBAR_ITEMS.slice(6).filter((_, i) => i !== 1),
              ]
            : [
                ...DEFAULT_TOOLBAR_ITEMS.slice(0, 5),
                ...DEFAULT_TOOLBAR_ITEMS.slice(6).filter((_, i) => i !== 1),
              ]
        } />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  editor: {
    flex: 1,
  },
  keyboardAvoidingView: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
  preview: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    minHeight: 80,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  previewContent: {
    flex: 1,
  },
});

const Label = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.gray2};
  margin-bottom: 4px;
`;

const PreviewText = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.gray1};
`;

const CloseText = styled.Text`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.mocha};
  font-weight: 600;
`;
