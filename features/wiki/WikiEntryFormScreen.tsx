import { WikiTranslationInput } from "@/api/wiki.api";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import * as Crypto from "expo-crypto";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "styled-components/native";
import styled from "styled-components/native";
import { MarkdownEditor } from "./components/MarkdownEditor";
import {
  useCreateWikiEntryMutation,
  useMyWikiEntriesQuery,
  useUpdateWikiEntryMutation,
  useWikiCategoriesQuery,
} from "./wiki.hooks";
import { WikiEntryFormScreenProps } from "./navigation/wiki-routes";
import { TextInput } from "@/components/inputs/TextInput";

type LocaleKey = "de" | "en" | "it" | "fr";
const LOCALES: LocaleKey[] = ["de", "en", "it", "fr"];

type FormValues = {
  categoryId: string;
  de_title: string;
  de_body: string;
  en_title: string;
  en_body: string;
  it_title: string;
  it_body: string;
  fr_title: string;
  fr_body: string;
};

export function WikiEntryFormScreen({
  route,
  navigation,
}: WikiEntryFormScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { entryId } = route.params ?? {};
  const isEdit = !!entryId;

  const [activeLocale, setActiveLocale] = useState<LocaleKey>(
    (locale as LocaleKey) in { de: true, en: true, it: true, fr: true }
      ? (locale as LocaleKey)
      : "de",
  );

  const { categories } = useWikiCategoriesQuery();
  const { myEntries } = useMyWikiEntriesQuery();

  // Pre-generate a UUID so images can be uploaded before the entry is saved (matches web behaviour).
  // On edit we use the existing entryId instead.
  const imageEntryId = useRef(entryId ?? Crypto.randomUUID()).current;

  const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      categoryId: "",
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

  // Pre-fill form when editing an existing entry
  useEffect(() => {
    if (!isEdit || !myEntries) return;
    const entry = myEntries.find((e) => e.id === entryId);
    if (!entry) return;

    setValue("categoryId", entry.categoryId);
    for (const loc of LOCALES) {
      const translation = entry.translations.find((tr) => tr.locale === loc);
      if (translation) {
        setValue(`${loc}_title`, translation.title);
        setValue(`${loc}_body`, translation.body);
      }
    }
  }, [isEdit, entryId, myEntries, setValue]);

  const createMutation = useCreateWikiEntryMutation((newEntryId) => {
    navigation.replace("WikiDetail", { entryId: newEntryId });
  });

  const updateMutation = useUpdateWikiEntryMutation(imageEntryId, () => {
    navigation.goBack();
  });

  const categoryOptions = categories.map((cat) => {
    const catTranslation =
      cat.translations.find((tr) => tr.locale === locale) ??
      cat.translations.find((tr) => tr.locale === "de");
    return { label: catTranslation?.name ?? cat.slug, value: cat.id };
  });

  function buildTranslations(values: FormValues): WikiTranslationInput[] {
    const translations: WikiTranslationInput[] = [];
    // DE is always required
    translations.push({
      locale: "de",
      title: values.de_title,
      body: values.de_body,
    });
    // EN/IT/FR only if both title and body are non-empty
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
    if (isEdit) {
      updateMutation.mutate({ categoryId: values.categoryId, translations });
    } else {
      // Pass the pre-generated UUID so any uploaded images are already linked
      createMutation.mutate({
        id: imageEntryId,
        categoryId: values.categoryId,
        translations,
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const categoryId = watch("categoryId");
  const titles = watch(["de_title", "en_title", "it_title", "fr_title"]);
  const hasAnyTitle = titles.some((title) => title?.trim().length > 0);
  const isSaveDisabled = isPending || !categoryId || !hasAnyTitle;

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSaveDisabled}
            style={{
              backgroundColor: theme.colors.buttonPrimary,
              borderRadius: theme.radii.m,
              paddingVertical: theme.spacing.m,
              alignItems: "center",
              opacity: isSaveDisabled ? 0.6 : 1,
            }}
          >
            <SaveLabel>{t("buttons.save")}</SaveLabel>
          </TouchableOpacity>
        </BottomActionContainer>
      }
    >
      <ScrollView>
        <View
          style={{ gap: theme.spacing.m, paddingBottom: theme.spacing.xxl }}
        >
          <RHSelect
            control={control}
            name="categoryId"
            label={t("wiki.category")}
            data={categoryOptions}
            enableSearch={categoryOptions.length > 6}
            rules={{ required: true }}
          />

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

          {/* Per-locale title and body fields */}
          {LOCALES.map((loc) => (
            <View
              key={loc}
              style={{
                display: activeLocale === loc ? "flex" : "none",
                gap: theme.spacing.s,
              }}
            >
              <Controller
                control={control}
                name={`${loc}_title`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    label={t("wiki.title")}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              <Controller
                control={control}
                name={`${loc}_body`}
                render={({ field: { onChange, value } }) => (
                  <MarkdownEditor
                    label={t("wiki.body")}
                    value={value ?? ""}
                    onChange={onChange}
                    entryId={imageEntryId}
                  />
                )}
              />
            </View>
          ))}
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
    active ? theme.colors.buttonPrimary : theme.colors.gray5};
`;

const LocaleTabLabel = styled.Text<{ active: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme, active }) =>
    active ? theme.colors.white : theme.colors.gray1};
`;

const SaveLabel = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  font-weight: 600;
`;
