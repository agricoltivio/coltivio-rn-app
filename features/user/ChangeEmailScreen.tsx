import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { useApi } from "@/api/api";
import { supabase } from "@/supabase/supabase";
import { Body, H2 } from "@/theme/Typography";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { ChangeEmailScreenProps } from "./navigation/user-routes";
import { useUserQuery } from "./users.hooks";

const redirectTo = `${process.env.EXPO_PUBLIC_WEB_URL}/auth/confirm`;

export function ChangeEmailScreen({ navigation }: ChangeEmailScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useUserQuery();
  const { setUser, authUser } = useSession();

  const [verificationMailSent, setVerificationMailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<{ email: string }>({
    defaultValues: { email: user?.email ?? undefined },
  });

  const api = useApi();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (verificationMailSent && user?.emailVerified) {
      setVerificationMailSent(false);
      setError(null);
    }
  }, [user]);

  async function onSubmit({ email }: { email: string }) {
    setSubmitting(true);
    const { error, data } = await supabase.auth.updateUser(
      {
        email,
      },
      {
        emailRedirectTo: redirectTo,
      },
    );
    setSubmitting(false);
    if (error || !data) {
      console.error(error?.code || error?.message);
      setError(t("errors.unexpected_retry"));
    } else {
      setUser(data.user);
      navigation.navigate("ChangeEmailPending", { newEmail: email });
    }
  }
  async function sendVerificationEmail() {
    try {
      await api.users.sendVerificationEmail();
      setVerificationMailSent(true);
      setError(null);
    } catch (error) {
      console.error(error);
      setError(t("errors.unexpected_retry"));
    }
  }

  const usesSocialLogin = authUser!.app_metadata.provider !== "email";
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            onPress={handleSubmit(onSubmit)}
            title={t("buttons.save")}
            disabled={!isDirty || !!error || submitting}
            loading={submitting}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={t("users.email")}
      >
        <H2>{t("users.email")}</H2>
        <View style={{ flex: 1, marginTop: theme.spacing.m }}>
          <RHTextInput
            name="email"
            control={control}
            label={t("forms.labels.email")}
            disabled={usesSocialLogin}
          />
          {!usesSocialLogin &&
            !user?.emailVerified &&
            !verificationMailSent && (
              <>
                <View
                  style={{
                    borderRadius: 10,
                    backgroundColor: theme.colors.warning,
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
                  onPress={sendVerificationEmail}
                />
              </>
            )}
          {verificationMailSent && (
            <View
              style={{
                borderRadius: 10,
                backgroundColor: theme.colors.warning,
                opacity: 0.7,
                marginTop: theme.spacing.m,
                padding: theme.spacing.s,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Body style={{ fontWeight: 800 }}>
                {t("users.verification_mail_sent", { email: authUser!.email })}
              </Body>
            </View>
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
