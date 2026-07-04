import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { H2, Subtitle } from "@/theme/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { IonIconButton } from "@/components/buttons/IconButton";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
} from "react-native";
import { WikiMarkdown } from "@/features/wiki/components/WikiMarkdown";
import styled from "styled-components/native";
import { useTheme } from "styled-components/native";
import { useDeleteWikiEntryMutation, useWikiDetailQuery } from "./wiki.hooks";
import { WikiDetailScreenProps } from "./navigation/wiki-routes";

function findTranslation<T extends { locale: string }>(
  translations: T[],
  currentLocale: string,
): T | undefined {
  return (
    translations.find((t) => t.locale === currentLocale) ??
    translations.find((t) => t.locale === "de")
  );
}

export function WikiDetailScreen({ route, navigation }: WikiDetailScreenProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const theme = useTheme();
  const { entryId } = route.params;
  const { entry, isLoading } = useWikiDetailQuery(entryId);

  const deleteMutation = useDeleteWikiEntryMutation(() => navigation.goBack());

  if (isLoading) {
    return (
      <ContentView headerVisible>
        <ActivityIndicator style={{ marginTop: 40 }} size="large" />
      </ContentView>
    );
  }

  if (!entry) {
    return (
      <ContentView headerVisible>
        <Subtitle>{t("common.no_entries")}</Subtitle>
      </ContentView>
    );
  }

  const entryTranslation = findTranslation(entry.translations, locale);
  const categoryTranslation = findTranslation(
    entry.category.translations,
    locale,
  );

  function onDeletePress() {
    Alert.alert(t("buttons.delete"), t("wiki.delete_confirm"), [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: () => deleteMutation.mutate(entryId),
      },
    ]);
  }

  return (
    <ContentView headerVisible>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showHeaderOnScroll
          headerTitleOnScroll={entryTranslation?.title ?? ""}
        >
          <View style={{ marginBottom: theme.spacing.m }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <H2 style={{ flex: 1, marginRight: theme.spacing.s }}>
                {entryTranslation?.title ?? ""}
              </H2>
              <View style={{ flexDirection: "row", gap: theme.spacing.xs }}>
                <IonIconButton
                  icon="create-outline"
                  type="accent"
                  iconSize={24}
                  color={theme.colors.primary}
                  onPress={() =>
                    navigation.navigate("WikiEntryForm", { entryId })
                  }
                />
                <IonIconButton
                  icon="trash-outline"
                  type="danger"
                  iconSize={24}
                  onPress={onDeletePress}
                />
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.xs,
                marginTop: theme.spacing.xs,
                flexWrap: "wrap",
              }}
            >
              {categoryTranslation && (
                <Chip>
                  <Text style={chipTextStyle}>{categoryTranslation.name}</Text>
                </Chip>
              )}
            </View>
          </View>

          <WikiMarkdown
            style={{
              body: {
                color: theme.colors.primary,
                fontSize: 16,
                lineHeight: 24,
              },
              heading1: { color: theme.colors.primary, lineHeight: 40 },
              heading2: { color: theme.colors.primary, lineHeight: 32 },
              heading3: { color: theme.colors.primary, lineHeight: 28 },
              link: { color: theme.colors.amber },
            }}
          >
            {entryTranslation?.body ?? ""}
          </WikiMarkdown>
        </ScrollView>
      </KeyboardAvoidingView>
    </ContentView>
  );
}

const Chip = styled(View)`
  border-radius: ${({ theme }) => theme.radii.xxl}px;
  padding-horizontal: 12px;
  padding-vertical: 6px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.gray3};
  background-color: ${({ theme }) => theme.colors.white};
`;

const chipTextStyle = {
  fontSize: 13,
  fontWeight: "500" as const,
};
