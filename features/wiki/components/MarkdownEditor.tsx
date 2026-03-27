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
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { marked } from "marked";
import { NodeHtmlMarkdown } from "node-html-markdown";
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

export function MarkdownEditor({
  value,
  onChange,
  label,
  entryId,
  readOnly,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  if (readOnly) {
    return (
      <View>
        {label && <Label>{label}</Label>}
        <View style={styles.preview}>
          {value ? (
            <WikiMarkdown>{value}</WikiMarkdown>
          ) : (
            <PreviewText>…</PreviewText>
          )}
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
              closeLabel={t("buttons.finish")}
              showImageUpload={true}
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

function EditorContent({
  value,
  onChange,
  entryId,
  onClose,
  closeLabel,
  showImageUpload,
}: EditorContentProps) {
  const api = useApi();
  const { t } = useTranslation();
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
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.8,
          });
          if (result.canceled || !result.assets[0]) return;

          const asset = result.assets[0];

          // Resize to the chosen max dimension on the longest side (preserves aspect ratio),
          // convert to JPEG for cross-platform support (handles HEIC from iOS),
          // and compress to reduce file size.
          async function uploadImage(maxDim: number) {
            try {
              const { width, height } = asset;
              const resizeAction: ImageManipulator.Action | undefined =
                width > maxDim || height > maxDim
                  ? width >= height
                    ? { resize: { width: maxDim } }
                    : { resize: { height: maxDim } }
                  : undefined;

              const manipulated = await ImageManipulator.manipulateAsync(
                asset.uri,
                resizeAction ? [resizeAction] : [],
                { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 },
              );

              const fileResponse = await fetch(manipulated.uri);
              const blob = await fileResponse.blob();

              const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
              if (blob.size > MAX_FILE_SIZE) {
                Alert.alert(t("common.error"), t("wiki.image_too_large"));
                return;
              }

              const rawFilename = asset.fileName ?? `image_${Date.now()}`;
              const filename = rawFilename.replace(/\.[^.]+$/, ".jpg");

              const { signedUrl, path } = await api.wiki.getImageSignedUrl(
                entryId,
                filename,
              );

              await fetch(resolveLocalUrl(signedUrl), {
                method: "PUT",
                body: blob,
              });

              const { publicUrl } = await api.wiki.registerImage(entryId, path);

              const resolvedUrl = resolveLocalUrl(publicUrl);
              e.setImage(resolvedUrl);
              // Insert a paragraph after the image so the cursor has somewhere to go
              setTimeout(() => {
                editor.webviewRef.current?.injectJavaScript(
                  `window.editor.chain().focus('end').createParagraphNear().run(); true;`,
                );
              }, 50);
            } catch {
              Alert.alert("Fehler", "Bild konnte nicht hochgeladen werden.");
            }
          }

          Alert.alert(t("wiki.image_size"), undefined, [
            {
              text: t("wiki.image_size_small"),
              onPress: () => uploadImage(400),
            },
            {
              text: t("wiki.image_size_medium"),
              onPress: () => uploadImage(700),
            },
            {
              text: t("wiki.image_size_large"),
              onPress: () => uploadImage(1200),
            },
            { text: t("buttons.cancel"), style: "cancel" },
          ]);
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
        <Toolbar
          editor={editor}
          items={
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
          }
        />
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
