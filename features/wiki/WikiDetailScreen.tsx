import { ContentView } from "@/components/containers/ContentView";
import { ScrollView } from "@/components/views/ScrollView";
import { locale } from "@/locales/i18n";
import { H2, Subtitle } from "@/theme/Typography";
import React from "react";
import { useTranslation } from "react-i18next";
import { IonIconButton } from "@/components/buttons/IconButton";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ActivityIndicator, Alert, View, Text } from "react-native";
import { WikiMarkdown } from "@/features/wiki/components/WikiMarkdown";
import styled from "styled-components/native";
import { useTheme } from "styled-components/native";
import {
  useDeleteWikiEntryMutation,
  useSubmitChangeRequestDraftMutation,
  useSubmitWikiEntryMutation,
  useWikiDetailQuery,
} from "./wiki.hooks";
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
  const { t } = useTranslation();
  const theme = useTheme();
  const { entryId } = route.params;
  const { entry, isLoading } = useWikiDetailQuery(entryId);

  const submitMutation = useSubmitWikiEntryMutation();
  const resubmitCRMutation = useSubmitChangeRequestDraftMutation();
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
  const isPrivate = entry.visibility === "private";
  const isPublished =
    entry.visibility === "public" && entry.status === "published";
  const activeCR = entry.activeChangeRequest;
  const isEditable = isPrivate && entry.status === "draft";
  const isUnderReview = entry.status === "under_review";
  const hasChangesRequested = activeCR?.status === "changes_requested";


  function onPublishPress() {
    Alert.alert(t("wiki.share"), t("wiki.share_confirm"), [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("wiki.share"),
        onPress: () => {
          if (hasChangesRequested && activeCR) {
            resubmitCRMutation.mutate(activeCR.id);
          } else {
            submitMutation.mutate(entryId);
          }
        },
      },
    ]);
  }

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
    <ContentView
      headerVisible
      footerComponent={
        isEditable ? (
          <BottomActionContainer>
            <FooterButton
              onPress={onPublishPress}
              disabled={submitMutation.isPending || resubmitCRMutation.isPending}
              style={{ opacity: (submitMutation.isPending || resubmitCRMutation.isPending) ? 0.6 : 1 }}
            >
              <ActionLabel>{t("wiki.share")}</ActionLabel>
            </FooterButton>
          </BottomActionContainer>
        ) : undefined
      }
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
            {isEditable && (
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
            )}
            {isPublished && (
              <IonIconButton
                icon="create-outline"
                type="accent"
                iconSize={24}
                color={theme.colors.primary}
                onPress={() => {
                  // Flow B: if there's already a changes_requested CR, edit its proposed translations
                  if (
                    activeCR?.type === "change_request" &&
                    activeCR?.status === "changes_requested"
                  ) {
                    navigation.navigate("WikiChangeRequestDraft", {
                      changeRequestId: activeCR.id,
                    });
                  } else {
                    navigation.navigate("WikiChangeRequest", { entryId });
                  }
                }}
              />
            )}
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
            {isPrivate && (
              <Chip>
                <Text style={chipTextStyle}>{t("wiki.private")}</Text>
              </Chip>
            )}
            {hasChangesRequested && (
              <Chip
                style={{
                  backgroundColor: theme.colors.secondary,
                  borderColor: theme.colors.secondary,
                }}
              >
                <Text style={[chipTextStyle, { color: theme.colors.white }]}>
                  {t("wiki.changes_requested")}
                </Text>
              </Chip>
            )}

            {isUnderReview && (
              <Chip
                style={{
                  backgroundColor: theme.colors.blue,
                  borderColor: theme.colors.blue,
                }}
              >
                <Text style={[chipTextStyle, { color: theme.colors.white }]}>
                  {t("wiki.status.under_review")}
                </Text>
              </Chip>
            )}
          </View>
        </View>

        <WikiMarkdown
          style={{
            body: { color: theme.colors.primary, fontSize: 16, lineHeight: 24 },
            heading1: { color: theme.colors.primary, lineHeight: 40 },
            heading2: { color: theme.colors.primary, lineHeight: 32 },
            heading3: { color: theme.colors.primary, lineHeight: 28 },
            link: { color: theme.colors.secondary },
          }}
        >
          {entryTranslation?.body ?? ""}
        </WikiMarkdown>
      </ScrollView>
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

const FooterButton = styled.TouchableOpacity`
  background-color: ${({ theme }) => theme.colors.mocha};
  border-radius: ${({ theme }) => theme.radii.m}px;
  padding-vertical: ${({ theme }) => theme.spacing.m}px;
  align-items: center;
`;

const ActionLabel = styled.Text`
  color: ${({ theme }) => theme.colors.white};
  font-size: 16px;
  font-weight: 600;
`;
