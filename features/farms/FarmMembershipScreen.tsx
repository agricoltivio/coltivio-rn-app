import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem, ListItemContent } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2, H3 } from "@/theme/Typography";
import { useTranslation } from "react-i18next";
import { Linking, View } from "react-native";
import { useTheme } from "styled-components/native";
import { supabase } from "@/supabase/supabase";
import { useFarmQuery } from "./farms.hooks";
import { FarmMembershipScreenProps } from "./navigation/farm-routes";

async function openMembershipUrl() {
  const baseUrl = __DEV__ ? "http://localhost:4000" : "https://app.coltivio.ch";
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (session) {
    const url = `${baseUrl}/auth/token?access_token=${session.access_token}&refresh_token=${session.refresh_token}&redirect=/membership`;
    Linking.openURL(url);
  } else {
    Linking.openURL(`${baseUrl}/membership`);
  }
}

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
  const isTrial = !!trialEndStr && !periodEndStr;
  const isActive = !!periodEndStr || !!trialEndStr;

  const statusLabel = isTrial
    ? t("membership.status_trial")
    : isActive
      ? t("membership.status_active")
      : t("membership.status_inactive");

  const endDateLabel = isTrial ? t("membership.trial_ends") : t("membership.valid_until");
  const endDateValue = isTrial ? trialEndStr : periodEndStr;

  const renewalLabel = membership?.autoRenewing
    ? t("membership.auto_renewing")
    : t("membership.cancels_at_period_end");

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={isActive ? t("membership.manage") : t("membership.become_member")}
            onPress={openMembershipUrl}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("membership.title")}>
        <H2>{t("membership.title")}</H2>

        {isActive ? (
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
            <ListItem hideBottomDivider>
              <ListItemContent>
                <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                  {renewalLabel}
                </ListItem.Title>
              </ListItemContent>
            </ListItem>
          </View>
        ) : (
          <>
            <H3 style={{ marginTop: theme.spacing.l }}>
              {t("membership.community_heading")}
            </H3>
            <Body style={{ marginTop: theme.spacing.m }}>
              {t("membership.community_text")}
            </Body>
          </>
        )}
      </ScrollView>
    </ContentView>
  );
}
