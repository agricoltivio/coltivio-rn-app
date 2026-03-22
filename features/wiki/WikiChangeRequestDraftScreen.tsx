import { WikiTranslationInput } from "@/api/wiki.api";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { Ionicons } from "@expo/vector-icons";
import { H3, Subtitle } from "@/theme/Typography";
import * as Crypto from "expo-crypto";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import styled from "styled-components/native";
import { useTheme } from "styled-components/native";
import { TextInput } from "@/components/inputs/TextInput";
import { MarkdownEditor } from "./components/MarkdownEditor";
import {
  useAddChangeRequestNoteMutation,
  useChangeRequestNotesQuery,
  useMyChangeRequestsQuery,
  useSubmitChangeRequestDraftMutation,
  useUpdateChangeRequestDraftMutation,
} from "./wiki.hooks";
import { WikiChangeRequestDraftScreenProps } from "./navigation/wiki-routes";
import { locale } from "@/locales/i18n";
import { useSession } from "@/auth/SessionProvider";

type LocaleKey = "de" | "en" | "it" | "fr";
const LOCALES: LocaleKey[] = ["de", "en", "it", "fr"];

type FormValues = {
  de_title: string;
  de_body: string;
  en_title: string;
  en_body: string;
  it_title: string;
  it_body: string;
  fr_title: string;
  fr_body: string;
};

export function WikiChangeRequestDraftScreen({
  route,
  navigation,
}: WikiChangeRequestDraftScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { changeRequestId } = route.params;
  const { authUser } = useSession();
  const [noteText, setNoteText] = useState("");
  // Stable UUID for image uploads in case changeRequest.entryId is unavailable
  const imageEntryId = useRef(Crypto.randomUUID()).current;

  const [activeLocale, setActiveLocale] = useState<LocaleKey>(
    (locale as LocaleKey) in { de: true, en: true, it: true, fr: true }
      ? (locale as LocaleKey)
      : "de",
  );

  const { changeRequests } = useMyChangeRequestsQuery();
  const changeRequest = changeRequests.find((cr) => cr.id === changeRequestId);
  // Only draft CRs can be edited — under_review means it's been submitted and awaits review
  const isEditable = changeRequest?.status === "draft";
  const { notes } = useChangeRequestNotesQuery(changeRequestId);

  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      de_title: "",
      de_body: "",
      en_title: "",
      en_body: "",
      it_title: "",
      it_body: "",
      fr_title: "",
      fr_body: "",
    },
  });

  // Pre-fill translations from the draft change request
  useEffect(() => {
    if (!changeRequest) return;
    for (const loc of LOCALES) {
      const translation = changeRequest.translations.find(
        (tr) => tr.locale === loc,
      );
      if (translation) {
        setValue(`${loc}_title`, translation.title);
        setValue(`${loc}_body`, translation.body);
      }
    }
  }, [changeRequest, setValue]);

  const updateMutation = useUpdateChangeRequestDraftMutation(
    changeRequestId,
    () => {
      navigation.goBack();
    },
  );

  const submitMutation = useSubmitChangeRequestDraftMutation(() => {
    navigation.goBack();
  });

  const addNoteMutation = useAddChangeRequestNoteMutation(changeRequestId);

  function buildTranslations(values: FormValues): WikiTranslationInput[] {
    const translations: WikiTranslationInput[] = [];
    translations.push({
      locale: "de",
      title: values.de_title,
      body: values.de_body,
    });
    for (const loc of ["en", "it", "fr"] as const) {
      const title = values[`${loc}_title`];
      const body = values[`${loc}_body`];
      if (title.trim() && body.trim()) {
        translations.push({ locale: loc, title, body });
      }
    }
    return translations;
  }

  function onSave(values: FormValues) {
    updateMutation.mutate({ translations: buildTranslations(values) });
  }

  function onSubmitPress() {
    Alert.alert(t("wiki.submit"), t("wiki.submit_confirm"), [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("wiki.submit"),
        onPress: () => submitMutation.mutate(changeRequestId),
      },
    ]);
  }

  function onSendNote() {
    const text = noteText.trim();
    if (!text) return;
    addNoteMutation.mutate(text);
    setNoteText("");
  }

  const isPending = updateMutation.isPending || submitMutation.isPending;

  return (
    <ContentView
      headerVisible
      footerComponent={
        isEditable ? (
          <BottomActionContainer>
            <FooterButton
              onPress={onSubmitPress}
              disabled={isPending}
              style={{ opacity: isPending ? 0.6 : 1 }}
            >
              <ButtonLabel style={{ color: theme.colors.white }}>
                {t("wiki.submit")}
              </ButtonLabel>
            </FooterButton>
          </BottomActionContainer>
        ) : undefined
      }
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView>
          <View
            style={{ gap: theme.spacing.m, paddingBottom: theme.spacing.xxl }}
          >
            {/* "Changes requested" notice — shown when reviewer sent the CR back as draft */}
            {isEditable && (
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  borderRadius: theme.radii.m,
                  padding: theme.spacing.s,
                }}
              >
                <H3 style={{ color: "#92400E" }}>
                  {t("wiki.changes_requested")}
                </H3>
              </View>
            )}

            {/* Locale tabs */}
            <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
              {LOCALES.map((loc) => (
                <LocaleTab
                  key={loc}
                  active={activeLocale === loc}
                  onPress={() => setActiveLocale(loc)}
                >
                  <LocaleTabLabel active={activeLocale === loc}>
                    {loc.toUpperCase()}
                  </LocaleTabLabel>
                </LocaleTab>
              ))}
            </View>

            {LOCALES.map((loc) => (
              <View
                key={loc}
                style={{
                  display: activeLocale === loc ? "flex" : "none",
                  gap: theme.spacing.s,
                }}
              >
                {loc === "de" && (
                  <H3 style={{ color: theme.colors.gray2, fontSize: 12 }}>
                    {t("wiki.required_locale_hint")}
                  </H3>
                )}
                <Controller
                  control={control}
                  name={`${loc}_title`}
                  rules={
                    loc === "de" && isEditable ? { required: true } : undefined
                  }
                  render={({
                    field: { onChange, onBlur, value },
                    fieldState,
                  }) => (
                    <TextInput
                      label={t("wiki.title")}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      disabled={!isEditable}
                      error={
                        fieldState.error
                          ? t("forms.validation.required")
                          : undefined
                      }
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`${loc}_body`}
                  rules={loc === "de" ? { required: true } : undefined}
                  render={({ field: { onChange, value } }) => (
                    <MarkdownEditor
                      label={t("wiki.body")}
                      value={value ?? ""}
                      onChange={onChange}
                      entryId={changeRequest?.entryId ?? imageEntryId}
                      readOnly={!isEditable}
                    />
                  )}
                />
              </View>
            ))}

            {/* Save button — only shown when CR is in draft (editable) state */}
            {isEditable && (
              <TouchableOpacity
                onPress={handleSubmit(onSave)}
                disabled={isPending}
                style={{
                  backgroundColor: theme.colors.gray4,
                  borderRadius: theme.radii.m,
                  paddingVertical: theme.spacing.m,
                  alignItems: "center",
                  opacity: isPending ? 0.6 : 1,
                }}
              >
                <ButtonLabel style={{ color: theme.colors.primary }}>
                  {t("buttons.save")}
                </ButtonLabel>
              </TouchableOpacity>
            )}

            {/* Comments thread */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.colors.gray4,
                paddingTop: theme.spacing.m,
              }}
            >
              <H3 style={{ marginBottom: theme.spacing.s }}>
                {t("wiki.comments")}
              </H3>
              {notes.map((note) => {
                const isOwn = note.authorId === authUser?.id;
                const time =
                  typeof note.createdAt === "string"
                    ? new Date(note.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";
                return (
                  <View
                    key={note.id}
                    style={{
                      alignSelf: isOwn ? "flex-end" : "flex-start",
                      maxWidth: "80%",
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: isOwn
                          ? theme.colors.primary
                          : theme.colors.gray5,
                        borderRadius: theme.radii.m,
                        borderBottomRightRadius: isOwn ? 4 : theme.radii.m,
                        borderBottomLeftRadius: isOwn ? theme.radii.m : 4,
                        padding: theme.spacing.s,
                      }}
                    >
                      <NoteText isOwn={isOwn}>{note.body}</NoteText>
                    </View>
                    {time ? (
                      <Text
                        style={{
                          fontSize: 11,
                          color: theme.colors.gray2,
                          marginTop: 2,
                          alignSelf: isOwn ? "flex-end" : "flex-start",
                        }}
                      >
                        {time}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* Comment input */}
            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.s,
                alignItems: "flex-end",
              }}
            >
              <View style={{ flex: 1 }}>
                <TextInput
                  hideLabel
                  placeholder={t("wiki.add_comment")}
                  value={noteText}
                  onChangeText={setNoteText}
                  multiline
                  returnKeyType="default"
                />
              </View>
              <TouchableOpacity
                onPress={onSendNote}
                disabled={addNoteMutation.isPending || !noteText.trim()}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radii.xxl,
                  padding: theme.spacing.s,
                  opacity:
                    addNoteMutation.isPending || !noteText.trim() ? 0.4 : 1,
                }}
              >
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ContentView>
  );
}

const LocaleTab = styled(TouchableOpacity)<{ active: boolean }>`
  flex: 1;
  padding-vertical: ${({ theme }) => theme.spacing.s}px;
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.s}px;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.mocha : theme.colors.gray5};
`;

const LocaleTabLabel = styled.Text<{ active: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme, active }) =>
    active ? theme.colors.white : theme.colors.gray1};
`;

const FooterButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.mocha};
  border-radius: ${({ theme }) => theme.radii.m}px;
  padding-vertical: ${({ theme }) => theme.spacing.m}px;
  align-items: center;
`;

const ButtonLabel = styled.Text`
  font-size: 16px;
  font-weight: 600;
`;

const NoteText = styled.Text<{ isOwn: boolean }>`
  font-size: 14px;
  color: ${({ theme, isOwn }) =>
    isOwn ? theme.colors.white : theme.colors.primary};
`;
