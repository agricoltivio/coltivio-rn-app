import { useSession } from "@/auth/SessionProvider";
import { queryKeys } from "@/cache/query-keys";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { ChangeEmailScreenProps } from "./navigation/user-routes";
import { supabase } from "@/supabase/supabase";
import { Body, H2 } from "@/theme/Typography";
import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useUserQuery } from "./users.hooks";
import { useTranslation } from "react-i18next";

export function ChangeEmailScreen({ navigation }: ChangeEmailScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useUserQuery();
  const { setUser, authUser } = useSession();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<{ email: string }>({
    defaultValues: { email: user?.email ?? undefined },
  });

  async function onSubmit({ email }: { email: string }) {
    const { error, data } = await supabase.auth.updateUser({
      email,
    });
    if (error || !data) {
      console.error(error?.code || error?.message);
      setError(t("errors.unexpected_retry"));
    } else {
      queryClient.invalidateQueries({ queryKey: queryKeys.users._def });
      setUser(data.user);
      navigation.goBack();
    }
  }
  async function resendConfirmationEmail() {
    supabase.auth.resend({
      email: authUser!.email!,
      type: "email_change",
    });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            onPress={handleSubmit(onSubmit)}
            title={t("buttons.save")}
            disabled={!isDirty || !!error}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={t("users.change_email")}
      >
        <H2>{t("users.change_email")}</H2>
        <Body style={{ marginTop: theme.spacing.m }}>
          {t("users.verify_new_email_before_in_effect")}
        </Body>
        <View style={{ flex: 1, marginTop: theme.spacing.m }}>
          <RHTextInput
            name="email"
            control={control}
            label={t("forms.labels.email")}
          />
          {authUser?.email_confirmed_at && (
            <>
              <View
                style={{
                  borderRadius: 10,
                  backgroundColor: theme.colors.yellow,
                  opacity: 0.7,
                  marginTop: theme.spacing.m,
                  padding: theme.spacing.s,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Body style={{ fontWeight: 800 }}>
                  {t("users.email_not_verified")}
                </Body>
              </View>
              <Button
                type="accent"
                style={{
                  marginTop: theme.spacing.m,
                }}
                title={t("users.resend_verification_email")}
                onPress={resendConfirmationEmail}
              />
            </>
          )}
          {error && (
            <View
              style={{
                borderRadius: 10,
                backgroundColor: theme.colors.danger,
                opacity: 0.7,
                marginTop: theme.spacing.m,
                padding: theme.spacing.s,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Body style={{ fontWeight: 800, color: "white" }}>{error}</Body>
            </View>
          )}
        </View>
      </ScrollView>
    </ContentView>
  );
}
