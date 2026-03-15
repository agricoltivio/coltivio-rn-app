import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem, ListItemContent } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { openManageMembershipUrl, openMembershipUrl } from "@/utils/membership";
import { useFarmQuery } from "./farms.hooks";
import { FarmMembershipScreenProps } from "./navigation/farm-routes";

function toDateString(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return new Date(value).toLocaleDateString("de-CH");
  }
  return null;
}

function InfoRow({
  label,
  value,
  hideBottomDivider = false,
}: {
  label: string;
  value: string;
  hideBottomDivider?: boolean;
}) {
  const theme = useTheme();
  return (
    <ListItem hideBottomDivider={hideBottomDivider}>
      <ListItemContent>
        <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
          {label}
        </ListItem.Title>
      </ListItemContent>
      <ListItem.Body style={{ paddingRight: theme.spacing.m }}>
        {value}
      </ListItem.Body>
    </ListItem>
  );
}

export function FarmMembershipScreen({}: FarmMembershipScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();

  const membership = farm?.membership;
  const trialEndStr = toDateString(membership?.trialEnd);
  const periodEndStr = toDateString(membership?.lastPeriodEnd);
  const now = new Date();
  const trialEndDate = membership?.trialEnd ? new Date(membership.trialEnd as string) : null;
  const periodEndDate = membership?.lastPeriodEnd ? new Date(membership.lastPeriodEnd as string) : null;
  const isActive = (periodEndDate !== null && periodEndDate > now) || (trialEndDate !== null && trialEndDate > now);
  // Trial is active whenever trialEnd is in the future, regardless of whether a paid period also exists
  const isTrial = trialEndDate !== null && trialEndDate > now;
  // Both trial is active and a paid membership period starts after the trial
  const hasPendingMembership = isTrial && periodEndDate !== null && periodEndDate > now;

  const statusLabel = isTrial
    ? t("membership.status_trial")
    : isActive
      ? t("membership.status_active")
      : t("membership.status_inactive");

  // When on trial, show trial end date; otherwise show paid period end date
  const endDateLabel = isTrial ? t("membership.trial_ends") : t("membership.valid_until");
  const endDateValue = isTrial ? trialEndStr : periodEndStr;
  // Show details view when there is or ever was a membership; community view only for brand new accounts
  const hasHadMembership = !!(trialEndDate || periodEndDate);

  const willRenew = !!membership?.autoRenewing && !membership?.cancelAtPeriodEnd;
  const renewalLabel = willRenew
    ? t("membership.auto_renewing")
    : t("membership.cancels_at_period_end");

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={hasHadMembership ? t("membership.manage") : t("membership.become_member")}
            onPress={hasHadMembership ? openManageMembershipUrl : openMembershipUrl}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("membership.title")}>
        <H2>{t("membership.title")}</H2>

        {hasHadMembership ? (
          <>
            {hasPendingMembership ? (
              <View style={{
                marginTop: theme.spacing.l,
                marginHorizontal: theme.spacing.xs,
                padding: theme.spacing.m,
                backgroundColor: theme.colors.primary + "18",
                borderRadius: theme.radii.m,
              }}>
                <Body style={{ color: theme.colors.primary }}>
                  {t("membership.starts_after_trial")}
                </Body>
              </View>
            ) : null}
          <View
            style={{
              marginTop: theme.spacing.l,
              borderRadius: theme.radii.l,
              overflow: "hidden",
              backgroundColor: theme.colors.white,
              marginHorizontal: theme.spacing.xs,
            }}
          >
            <InfoRow label={t("membership.status_label")} value={statusLabel} />
            {endDateValue ? (
              <InfoRow label={endDateLabel} value={endDateValue} />
            ) : null}
            {isActive && (
              <ListItem hideBottomDivider>
                <ListItemContent>
                  <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                    {renewalLabel}
                  </ListItem.Title>
                </ListItemContent>
              </ListItem>
            )}
          </View>
          </>
        ) : (
          <>
            <Body style={{ marginTop: theme.spacing.l, fontWeight: "bold" }}>
              {t("agri_coltivio.section_4")}
            </Body>
            <H3 style={{ marginTop: theme.spacing.l }}>
              {t("membership.community_heading")}
            </H3>
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("agri_coltivio.community_text")}
            </Body>
            <Body style={{ marginTop: theme.spacing.s }}>
              {t("agri_coltivio.community_text_2")}
            </Body>
          </>
        )}
      </ScrollView>
    </ContentView>
  );
}
