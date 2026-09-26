import { DeletionOutcome } from "@/api/user.api";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { useMembershipStatusQuery } from "@/features/farms/farms.hooks";
import { Body, Caption1, H2, H3, Subtitle } from "@/theme/Typography";
import { isMembershipActive } from "@/utils/membership";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
};

export function DeleteAccountScreen(_: DeleteAccountScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useUserQuery();
  const { farms, isLoading } = useDeletionPreviewQuery();
  const { membershipStatus } = useMembershipStatusQuery();
  const [error, setError] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<FormValues>({
    defaultValues: { email: "" },
  });

  const deleteAccountMutation = useDeleteAccountMutation(() => {
    setError(t("users.delete_account.error"));
  });

  const email = useWatch({ control, name: "email" });
  const emailMatches =
    !!user && email.trim().toLowerCase() === user.email.trim().toLowerCase();

  function onSubmit(values: FormValues) {
    setError(null);
    deleteAccountMutation.mutate({ email: values.email });
  }

  const outcomeText: Record<
    DeletionOutcome,
    { title: string; hint: string; color: string }
  > = {
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
            {/* The Record forces outcomeText to cover every API outcome, so its keys are the full list */}
            {(Object.keys(outcomeText) as DeletionOutcome[]).map((outcome) => {
              const group = farms.filter((farm) => farm.outcome === outcome);
              if (group.length === 0) return null;
              const text = outcomeText[outcome];
              return (
                <Card
                  key={outcome}
                  style={[
                    { gap: theme.spacing.s },
                    outcome === "delete" && {
                      borderWidth: 2,
                      borderColor: theme.colors.danger,
                    },
                  ]}
                >
                  <Subtitle style={{ color: text.color }}>
                    {text.title}
                  </Subtitle>
                  <Caption1 style={{ color: theme.colors.gray2 }}>
                    {text.hint}
                  </Caption1>
                  {group.map((farm) => (
                    <Body key={farm.id} style={{ fontWeight: "600" }}>
                      {farm.name}
                    </Body>
                  ))}
                </Card>
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
