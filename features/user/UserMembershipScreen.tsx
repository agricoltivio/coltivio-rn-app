import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { ListItem, ListItemContent } from "@/components/list/ListItem";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2, H3 } from "@/theme/Typography";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Switch, Text, View } from "react-native";
import { useTheme } from "styled-components/native";
import { canLinkToMembership, openMoreInfoUrl } from "@/utils/membership";
import {
  useMembershipCancelMutation,
  useMembershipCheckoutMutation,
  useMembershipDisableAutoRenewMutation,
  useMembershipPaymentMethodMutation,
  useMembershipPaymentsQuery,
  useMembershipReactivateMutation,
  useMembershipStatusQuery,
} from "@/features/farms/farms.hooks";
import { AgriColtivioPitch } from "@/features/agri-coltivio/AgriColtivioPitch";
import { MembershipCancelledModal } from "@/features/agri-coltivio/MembershipCancelledModal";
import { MembershipThankYouModal } from "@/features/agri-coltivio/MembershipThankYouModal";
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

export function UserMembershipScreen({ route }: UserMembershipScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { membershipStatus } = useMembershipStatusQuery();
  const checkoutMutation = useMembershipCheckoutMutation();
  const cancelMutation = useMembershipCancelMutation();
  const reactivateMutation = useMembershipReactivateMutation();
  const disableAutoRenewMutation = useMembershipDisableAutoRenewMutation();
  const paymentMethodMutation = useMembershipPaymentMethodMutation();

  const [statutenVisible, setStatutenVisible] = useState(false);
  const [thankYouVisible, setThankYouVisible] = useState(false);
  const [cancelConfirmedVisible, setCancelConfirmedVisible] = useState(false);

  // Reaching this screen from "become a member" elsewhere (info screen, home promo popup)
  // opens the Statuten dialog immediately, so the whole checkout + thank-you flow happens
  // here in one consistent place regardless of where the user started.
  useEffect(() => {
    if (route.params?.autoOpenStatuten) {
      setStatutenVisible(true);
    }
  }, [route.params?.autoOpenStatuten]);

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
  // The raw paid period, regardless of whether the user has resigned from it.
  const periodStillRunning = periodEndDate !== null && periodEndDate > now;
  const daysUntilExpiry = periodEndDate
    ? Math.ceil(
        (periodEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;
  const cancelAtPeriodEnd = !!membership?.cancelAtPeriodEnd;
  // Formal Vereins-Austritt (resignation) — takes effect immediately, unlike auto-renew off.
  const cancelledByUser = !!membership?.cancelledByUser;
  // Mirrors the backend (membership.ts isActive/isPaidMember): a resigned user is immediately
  // out, even if their paid-through date hasn't arrived yet.
  const isActive = hasActiveTrial || (periodStillRunning && !cancelledByUser);
  // Pure trial: trial running, no paid period lined up yet
  const isTrial = hasActiveTrial && !periodEndDate;
  // Trial running AND already subscribed — Stripe charges once the trial ends
  const isSubscribedDuringTrial = hasActiveTrial && !!periodEndDate;
  // Ever had a trial or paid period at all (vs. a brand new account)
  const hasHadMembership = !!(trialEndDate || periodEndDate);
  // Resigned, but the paid-through date hasn't passed yet — the Austritt can still be undone.
  const canUndoResignation = cancelledByUser && periodStillRunning;

  // A real subscription to manage (auto-renew/cancel/update payment method) — covers both an
  // active paid period and "subscribed during trial"; a pure trial has nothing to manage yet.
  const hasManagedSubscription = isActive && !isTrial;
  const showCancelButton = hasManagedSubscription;
  // Only a real Stripe subscription can be toggled — one-time/manual payers (e.g. Twint, which
  // never supports subscriptions) have nothing to switch, so the row is hidden for them entirely.
  const showAutoRenewSwitch =
    hasManagedSubscription &&
    !isSubscribedDuringTrial &&
    !!membership?.autoRenewing;
  const showUndoButton = canUndoResignation;
  const showPaymentMethodButton = hasManagedSubscription;
  // Manual (non-auto-renewing) members can top up early — the backend stacks the new period on
  // top of their remaining time instead of resetting it. Anyone with a subscription — even one
  // that's set not to renew — can't: keeping "one live subscription = the membership" simple
  // avoids ever having a subscription and a manual top-up both covering the same period. The
  // backend rejects a manual payment whenever a live subscription exists, regardless of
  // cancelAtPeriodEnd.
  const showRenewButton =
    hasManagedSubscription &&
    !isSubscribedDuringTrial &&
    !membership?.autoRenewing &&
    daysUntilExpiry !== null &&
    daysUntilExpiry >= 0 &&
    daysUntilExpiry <= 60;

  const { payments } = useMembershipPaymentsQuery(hasHadMembership);
  // Filter out CHF 0 invoices Stripe generates when subscribing during a trial
  const visiblePayments = (payments ?? []).filter((p) => p.amount > 0);

  function onBecomeMemberConfirm(autoRenew: boolean) {
    checkoutMutation.mutate(autoRenew, {
      onSuccess: (succeeded) => {
        if (succeeded) setThankYouVisible(true);
      },
    });
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
          onPress: () =>
            cancelMutation.mutate(undefined, {
              onSuccess: () => setCancelConfirmedVisible(true),
            }),
        },
      ],
    );
  }

  function onToggleAutoRenew(enabled: boolean) {
    if (enabled) {
      reactivateMutation.mutate();
    } else {
      disableAutoRenewMutation.mutate();
    }
  }

  return (
    <ContentView
      footerComponent={
        canLinkToMembership &&
        !hasManagedSubscription &&
        !canUndoResignation ? (
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
        ) : showCancelButton ? (
          <BottomActionContainer>
            <Button
              type="danger"
              title={t("membership.cancel_dialog.confirm")}
              loading={cancelMutation.isPending}
              onPress={onCancelMembership}
            />
          </BottomActionContainer>
        ) : undefined
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("membership.title")}
      >
        <H2>{t("membership.title")}</H2>

        {canUndoResignation ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: theme.spacing.s,
              marginTop: theme.spacing.m,
              marginHorizontal: theme.spacing.xs,
              padding: theme.spacing.m,
              borderRadius: theme.radii.l,
              backgroundColor: theme.colors.danger + "22",
            }}
          >
            <Ionicons
              name="alert-circle"
              size={20}
              color={theme.colors.danger}
            />
            <Body style={{ color: theme.colors.danger, flex: 1 }}>
              {t("membership.resigned_notice", { date: periodEndStr ?? "" })}
            </Body>
          </View>
        ) : null}

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
              {hasManagedSubscription &&
              !isSubscribedDuringTrial &&
              periodEndStr ? (
                <InfoRow
                  label={t("membership.valid_until")}
                  value={periodEndStr}
                />
              ) : null}
              {showAutoRenewSwitch ? (
                <ListItem hideBottomDivider>
                  <ListItemContent>
                    <ListItem.Title style={{ paddingLeft: theme.spacing.m }}>
                      {t("membership.auto_renewing")}
                    </ListItem.Title>
                  </ListItemContent>
                  <Switch
                    style={{ marginRight: theme.spacing.m }}
                    value={!cancelAtPeriodEnd}
                    onValueChange={onToggleAutoRenew}
                    disabled={
                      disableAutoRenewMutation.isPending ||
                      reactivateMutation.isPending
                    }
                  />
                </ListItem>
              ) : null}
              {!isActive && !isTrial && periodEndStr ? (
                <InfoRow
                  label={t("membership.valid_until")}
                  value={periodEndStr}
                  hideBottomDivider
                />
              ) : null}
            </View>

            {isActive && (
              <Body style={{ marginTop: theme.spacing.m }}>
                {t("membership.thank_you.body_pre")}
                <Text
                  style={{
                    color: theme.colors.primary,
                    textDecorationLine: "underline",
                    fontWeight: "600",
                  }}
                  onPress={openMoreInfoUrl}
                >
                  {t("membership.thank_you.body_link")}
                </Text>
                {t("membership.thank_you.body_post")}
              </Body>
            )}

            {(showPaymentMethodButton || showRenewButton || showUndoButton) && (
              <View
                style={{
                  gap: theme.spacing.s,
                  marginTop: theme.spacing.m,
                  marginHorizontal: theme.spacing.xs,
                }}
              >
                {showRenewButton && (
                  <Button
                    title={t("membership.renew")}
                    loading={checkoutMutation.isPending}
                    onPress={() => setStatutenVisible(true)}
                  />
                )}
                {showPaymentMethodButton && (
                  <Button
                    type="accent"
                    title={t("membership.update_payment_method")}
                    loading={paymentMethodMutation.isPending}
                    onPress={() => paymentMethodMutation.mutate()}
                  />
                )}
                {showUndoButton && (
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
                        <ListItem.Title
                          style={{ paddingLeft: theme.spacing.m }}
                        >
                          {toDateString(payment.createdAt) ?? "—"}
                        </ListItem.Title>
                        <ListItem.Body style={{ paddingLeft: theme.spacing.m }}>
                          {payment.cardBrand && payment.cardLast4
                            ? `${payment.cardBrand.toUpperCase()} •••• ${payment.cardLast4}`
                            : payment.paymentMethodType === "twint"
                              ? t("membership.payment_method_twint")
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
      <MembershipThankYouModal
        visible={thankYouVisible}
        onClose={() => setThankYouVisible(false)}
      />
      <MembershipCancelledModal
        visible={cancelConfirmedVisible}
        onClose={() => setCancelConfirmedVisible(false)}
      />
    </ContentView>
  );
}
