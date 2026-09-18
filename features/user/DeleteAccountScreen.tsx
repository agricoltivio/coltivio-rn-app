import { DeletionPreviewFarm } from "@/api/user.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { RHSelect } from "@/components/select/RHSelect";
import { ScrollView } from "@/components/views/ScrollView";
import { useMembershipStatusQuery } from "@/features/farms/farms.hooks";
import { Body, Caption1, H2, H3, Subtitle } from "@/theme/Typography";
import { isMembershipActive } from "@/utils/membership";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "styled-components/native";
import { DeleteAccountScreenProps } from "./navigation/user-routes";
import {
  useDeleteAccountMutation,
  useDeletionPreviewQuery,
  useUserQuery,
} from "./users.hooks";

type FormValues = {
  email: string;
  // farmId -> userId of the new owner
  transfers: Record<string, string>;
};

const OUTCOMES = ["transfer", "delete", "leave"] as const;

export function DeleteAccountScreen(_: DeleteAccountScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useUserQuery();
  const { farms, isLoading, refetch } = useDeletionPreviewQuery();
  const { membershipStatus } = useMembershipStatusQuery();
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: { email: "", transfers: {} },
  });

  // Every fresh preview preselects the first member as successor, so a
  // reloaded preview never keeps a choice that is no longer valid
  useEffect(() => {
    if (!farms) return;
    const transfers = Object.fromEntries(
      farms
        .filter((farm) => farm.outcome === "transfer")
        .map((farm) => [farm.id, farm.candidates[0].id]),
    );
    reset((values) => ({ ...values, transfers }));
  }, [farms, reset]);

  const deleteAccountMutation = useDeleteAccountMutation((mutationError) => {
    if (mutationError.message === "preview_outdated") {
      setError(t("users.delete_account.preview_outdated"));
      refetch();
    } else {
      setError(t("users.delete_account.error"));
    }
  });

  const email = watch("email");
  const emailMatches =
    !!user && email.trim().toLowerCase() === user.email.trim().toLowerCase();

  function onSubmit(values: FormValues) {
    setError(null);
    deleteAccountMutation.mutate({
      email: values.email,
      transfers: values.transfers,
    });
  }

  const outcomeText: Record<
    DeletionPreviewFarm["outcome"],
    { title: string; hint: string; color: string }
  > = {
    transfer: {
      title: t("users.delete_account.transfer_title"),
      hint: t("users.delete_account.transfer_hint"),
      color: theme.colors.primary,
    },
    delete: {
      title: t("users.delete_account.delete_title"),
      hint: t("users.delete_account.delete_hint"),
      color: theme.colors.danger,
    },
    leave: {
      title: t("users.delete_account.leave_title"),
      hint: t("users.delete_account.leave_hint"),
      color: theme.colors.gray1,
    },
  };

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="danger"
            title={t("users.delete_account.confirm_button")}
            onPress={handleSubmit(onSubmit)}
            loading={deleteAccountMutation.isPending}
            disabled={
              !emailMatches || !farms || deleteAccountMutation.isPending
            }
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={t("users.delete_account.title")}
      >
        <H2 style={{ color: theme.colors.danger }}>
          {t("users.delete_account.title")}
        </H2>
        <Body style={{ marginTop: theme.spacing.s }}>
          {t("users.delete_account.intro")}
        </Body>

        {isMembershipActive(membershipStatus) ? (
          <Card
            style={{
              backgroundColor: theme.colors.warning,
              marginTop: theme.spacing.m,
            }}
          >
            <Body style={{ color: theme.colors.black }}>
              {t("users.delete_account.membership_warning")}
            </Body>
          </Card>
        ) : null}

        {isLoading ? (
          <ActivityIndicator style={{ marginTop: theme.spacing.l }} />
        ) : null}

        {farms && farms.length > 0 ? (
          <View style={{ marginTop: theme.spacing.l, gap: theme.spacing.m }}>
            <H3>{t("users.delete_account.farms_title")}</H3>
            {OUTCOMES.map((outcome) => {
              const group = farms.filter((farm) => farm.outcome === outcome);
              if (group.length === 0) return null;
              const text = outcomeText[outcome];
              return (
                <View key={outcome} style={{ gap: theme.spacing.s }}>
                  <Subtitle style={{ color: text.color }}>
                    {text.title}
                  </Subtitle>
                  <Caption1 style={{ color: theme.colors.gray2 }}>
                    {text.hint}
                  </Caption1>
                  {group.map((farm) => (
                    <Card key={farm.id}>
                      <Body style={{ fontWeight: "600" }}>{farm.name}</Body>
                      {outcome === "transfer" ? (
                        <RHSelect
                          name={`transfers.${farm.id}`}
                          control={control}
                          label={t("users.delete_account.new_owner_label")}
                          data={farm.candidates.map((candidate) => ({
                            label: candidate.fullName ?? candidate.email,
                            value: candidate.id,
                          }))}
                        />
                      ) : null}
                    </Card>
                  ))}
                </View>
              );
            })}
          </View>
        ) : null}

        <Body style={{ marginTop: theme.spacing.l, color: theme.colors.gray1 }}>
          {t("users.delete_account.kept_content")}
        </Body>

        <View style={{ marginTop: theme.spacing.l }}>
          <RHTextInput
            name="email"
            control={control}
            label={t("users.delete_account.confirm_label")}
            placeholder={user?.email}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            error={
              email.length > 0 && !emailMatches
                ? t("users.delete_account.email_mismatch")
                : undefined
            }
          />
        </View>

        {error ? (
          <Card
            style={{
              backgroundColor: theme.colors.danger,
              marginTop: theme.spacing.m,
            }}
          >
            <Body style={{ color: theme.colors.white }}>{error}</Body>
          </Card>
        ) : null}
      </ScrollView>
    </ContentView>
  );
}
