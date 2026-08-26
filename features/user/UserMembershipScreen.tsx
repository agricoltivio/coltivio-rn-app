import { Button } from "@/components/buttons/Button";
import { Chip } from "@/components/chips/Chip";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem, ListItemContent } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2, H3 } from "@/theme/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, View } from "react-native";
import { useTheme } from "styled-components/native";
import { canLinkToMembership } from "@/utils/membership";
import {
  useMembershipCancelMutation,
  useMembershipCheckoutMutation,
  useMembershipPaymentMethodMutation,
  useMembershipPaymentsQuery,
  useMembershipReactivateMutation,
  useMembershipStatusQuery,
} from "@/features/farms/farms.hooks";
import { AgriColtivioPitch } from "@/features/agri-coltivio/AgriColtivioPitch";
import { StatutenDialog } from "@/features/agri-coltivio/StatutenDialog";
import { UserMembershipScreenProps } from "./navigation/user-routes";

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

export function UserMembershipScreen({}: UserMembershipScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { membershipStatus } = useMembershipStatusQuery();
  const checkoutMutation = useMembershipCheckoutMutation();
  const cancelMutation = useMembershipCancelMutation();
  const reactivateMutation = useMembershipReactivateMutation();
  const paymentMethodMutation = useMembershipPaymentMethodMutation();

  const [statutenVisible, setStatutenVisible] = useState(false);

  const membership = membershipStatus;
  const trialEndStr = toDateString(membership?.trialEnd);
  const periodEndStr = toDateString(membership?.lastPeriodEnd);
  const now = new Date();
  const trialEndDate = membership?.trialEnd
    ? new Date(membership.trialEnd as string)
    : null;
  const periodEndDate = membership?.lastPeriodEnd
    ? new Date(membership.lastPeriodEnd as string)
    : null;
  const hasActiveTrial = trialEndDate !== null && trialEndDate > now;
  const hasActivePeriod = periodEndDate !== null && periodEndDate > now;
  const isActive = hasActiveTrial || hasActivePeriod;
  // Pure trial: trial running, no paid period lined up yet
  const isTrial = hasActiveTrial && !periodEndDate;
  // Trial running AND already subscribed — Stripe charges once the trial ends
  const isSubscribedDuringTrial = hasActiveTrial && !!periodEndDate;
  // Ever had a trial or paid period at all (vs. a brand new account)
  const hasHadMembership = !!(trialEndDate || periodEndDate);
  const cancelAtPeriodEnd = !!membership?.cancelAtPeriodEnd;
  const cancelledByUser = !!membership?.cancelledByUser;

  // A real subscription to manage (cancel/reactivate/update payment method) — covers both an
  // active paid period and "subscribed during trial"; a pure trial has nothing to manage yet.
  const hasManagedSubscription = isActive && !isTrial;
  const showCancelButton =
    hasManagedSubscription && !cancelledByUser && !cancelAtPeriodEnd;
  const showReactivateButton =
    hasManagedSubscription && (cancelAtPeriodEnd || cancelledByUser);
  const showPaymentMethodButton = hasManagedSubscription && !cancelledByUser;

  const { payments } = useMembershipPaymentsQuery(hasHadMembership);
  // Filter out CHF 0 invoices Stripe generates when subscribing during a trial
  const visiblePayments = (payments ?? []).filter((p) => p.amount > 0);

  function onBecomeMemberConfirm(autoRenew: boolean) {
    checkoutMutation.mutate(autoRenew);
  }

  function onCancelMembership() {
    Alert.alert(
      t("membership.cancel_dialog.title"),
      `${t("membership.cancel_dialog.description")}\n\n${t(
        "membership.cancel_dialog.art6_note",
        { date: periodEndStr ?? "" },
      )}`,
      [
        { text: t("buttons.cancel"), style: "cancel" },
        {
          text: t("membership.cancel_dialog.confirm"),
          style: "destructive",
          onPress: () => cancelMutation.mutate(),
        },
      ],
    );
  }

  return (
    <ContentView
      footerComponent={
        canLinkToMembership && !hasManagedSubscription ? (
          <BottomActionContainer>
            <Body style={{ color: theme.colors.gray1, textAlign: "center" }}>
              {t("membership.price_info")}
            </Body>
            <Button
              style={{ marginTop: theme.spacing.s }}
              title={
                hasHadMembership && !isActive
                  ? t("membership.renew")
                  : t("membership.become_member")
              }
              onPress={() => setStatutenVisible(true)}
              loading={checkoutMutation.isPending}
            />
          </BottomActionContainer>
        ) : undefined
      }
    >
      <ScrollView showHeaderOnScroll headerTitleOnScroll={t("membership.title")}>
        <H2>{t("membership.title")}</H2>

        {hasHadMembership ? (
          <>
            <View
              style={{
                marginTop: theme.spacing.l,
                borderRadius: theme.radii.l,
                overflow: "hidden",
                backgroundColor: theme.colors.white,
                marginHorizontal: theme.spacing.xs,
              }}
            >
              <InfoRow
                label={t("membership.status_label")}
                value={
                  isTrial
                    ? t("membership.status_trial")
                    : isActive
                      ? t("membership.status_active")
                      : t("membership.status_inactive")
                }
              />
              {isTrial && trialEndStr ? (
                <InfoRow
                  label={t("membership.trial_ends")}
                  value={trialEndStr}
                />
              ) : null}
              {isSubscribedDuringTrial && trialEndStr ? (
                <ListItem hideBottomDivider>
                  <ListItemContent>
                    <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                      {t("membership.subscription_starts_after_trial", {
                        date: trialEndStr,
                      })}
                    </ListItem.Title>
                  </ListItemContent>
                </ListItem>
              ) : null}
              {hasManagedSubscription && !isSubscribedDuringTrial && periodEndStr ? (
                <InfoRow
                  label={t("membership.valid_until")}
                  value={periodEndStr}
                  hideBottomDivider={!cancelAtPeriodEnd}
                />
              ) : null}
              {!isActive && !isTrial && periodEndStr ? (
                <InfoRow
                  label={t("membership.valid_until")}
                  value={periodEndStr}
                  hideBottomDivider
                />
              ) : null}
              {cancelAtPeriodEnd && hasManagedSubscription && !isSubscribedDuringTrial ? (
                <ListItem hideBottomDivider>
                  <ListItemContent>
                    <Chip
                      label={t("membership.cancels_at_period_end")}
                      bgColor={theme.colors.warning + "22"}
                      textColor={theme.colors.warning}
                    />
                  </ListItemContent>
                </ListItem>
              ) : null}
            </View>

            {hasManagedSubscription && (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: theme.spacing.s,
                  marginTop: theme.spacing.m,
                  marginHorizontal: theme.spacing.xs,
                }}
              >
                {showPaymentMethodButton && (
                  <Button
                    type="accent"
                    title={t("membership.update_payment_method")}
                    loading={paymentMethodMutation.isPending}
                    onPress={() => paymentMethodMutation.mutate()}
                  />
                )}
                {showCancelButton && (
                  <Button
                    type="danger"
                    title={t("membership.cancel_dialog.confirm")}
                    loading={cancelMutation.isPending}
                    onPress={onCancelMembership}
                  />
                )}
                {showReactivateButton && (
                  <Button
                    type="accent"
                    title={t("membership.reactivate")}
                    loading={reactivateMutation.isPending}
                    onPress={() => reactivateMutation.mutate()}
                  />
                )}
              </View>
            )}

            {visiblePayments.length > 0 && (
              <>
                <H3 style={{ marginTop: theme.spacing.xl }}>
                  {t("membership.payment_history")}
                </H3>
                <View
                  style={{
                    marginTop: theme.spacing.m,
                    borderRadius: theme.radii.l,
                    overflow: "hidden",
                    backgroundColor: theme.colors.white,
                    marginHorizontal: theme.spacing.xs,
                  }}
                >
                  {visiblePayments.map((payment, index) => (
                    <ListItem
                      key={payment.id}
                      hideBottomDivider={index === visiblePayments.length - 1}
                    >
                      <ListItemContent>
                        <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                          {toDateString(payment.createdAt) ?? "—"}
                        </ListItem.Title>
                        <ListItem.Body style={{ paddingLeft: theme.spacing.m }}>
                          {payment.cardBrand && payment.cardLast4
                            ? `${payment.cardBrand.toUpperCase()} •••• ${payment.cardLast4}`
                            : "—"}
                        </ListItem.Body>
                      </ListItemContent>
                      <ListItem.Body style={{ paddingRight: theme.spacing.m }}>
                        {`CHF ${(payment.amount / 100).toFixed(2)}`}
                      </ListItem.Body>
                    </ListItem>
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <AgriColtivioPitch compact />
        )}
      </ScrollView>

      <StatutenDialog
        visible={statutenVisible}
        onClose={() => setStatutenVisible(false)}
        onConfirm={onBecomeMemberConfirm}
        showAutoRenewal
      />
    </ContentView>
  );
}
