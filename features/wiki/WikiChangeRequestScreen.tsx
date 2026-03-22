import { WikiTranslationInput } from "@/api/wiki.api";
import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { H3 } from "@/theme/Typography";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import styled from "styled-components/native";
import { useTheme } from "styled-components/native";
import { TextInput } from "@/components/inputs/TextInput";
import { MarkdownEditor } from "./components/MarkdownEditor";
import {
  useCreateChangeRequestMutation,
  useWikiDetailQuery,
} from "./wiki.hooks";
import { WikiChangeRequestScreenProps } from "./navigation/wiki-routes";

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

export function WikiChangeRequestScreen({
  route,
  navigation,
}: WikiChangeRequestScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { entryId } = route.params;

  const [activeLocale, setActiveLocale] = useState<LocaleKey>(
    (locale as LocaleKey) in { de: true, en: true, it: true, fr: true }
      ? (locale as LocaleKey)
      : "de",
  );

  const { entry } = useWikiDetailQuery(entryId);

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

  // Pre-fill translations from the published entry
  useEffect(() => {
    if (!entry) return;
    for (const loc of LOCALES) {
      const translation = entry.translations.find((tr) => tr.locale === loc);
      if (translation) {
        setValue(`${loc}_title`, translation.title);
        setValue(`${loc}_body`, translation.body);
      }
    }
  }, [entry, setValue]);

  const createChangeRequestMutation = useCreateChangeRequestMutation(() => {
    navigation.goBack();
  });

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

  function onSubmit(values: FormValues) {
    const translations = buildTranslations(values);
    createChangeRequestMutation.mutate({ entryId, translations });
  }

  const isPending = createChangeRequestMutation.isPending;

  return (
    <ContentView headerVisible>
      <ScrollView>
        <View
          style={{ gap: theme.spacing.m, paddingBottom: theme.spacing.xxl }}
        >
          {/* Locale tab switcher */}
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
                rules={loc === "de" ? { required: true } : undefined}
                render={({
                  field: { onChange, onBlur, value },
                  fieldState,
                }) => (
                  <TextInput
                    label={t("wiki.title")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
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
                    entryId={entryId}
                  />
                )}
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isPending}
            style={{
              backgroundColor: theme.colors.mocha,
              borderRadius: theme.radii.m,
              paddingVertical: theme.spacing.m,
              alignItems: "center",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <SubmitLabel>{t("wiki.propose_changes")}</SubmitLabel>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

const SubmitLabel = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  font-weight: 600;
`;
