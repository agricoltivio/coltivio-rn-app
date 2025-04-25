import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { supabase } from "@/supabase/supabase";
import { Body, H2 } from "@/theme/Typography";
import { makeRedirectUri } from "expo-auth-session";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { ChangeEmailScreenProps } from "./navigation/user-routes";
import { useUpdateUserMutation, useUserQuery } from "./users.hooks";

const redirectTo = makeRedirectUri({
  scheme: "ch.agricoltivio.coltivio",
  path: "EmailVerified",
});

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

  const updateUserMutation = useUpdateUserMutation();

  useEffect(() => {
    if (verificationMailSent && user?.emailVerified) {
      setVerificationMailSent(false);
      setError(null);
    }
  }, [user]);

  async function onSubmit({ email }: { email: string }) {
    const { error, data } = await supabase.auth.updateUser(
      {
        email,
      },
      {
        emailRedirectTo: redirectTo,
      }
    );
    if (error || !data) {
      console.error(error?.code || error?.message);
      setError(t("errors.unexpected_retry"));
    } else {
      setUser(data.user);
      updateUserMutation.mutate({ emailVerified: false });
      navigation.navigate("ChangeEmailPending", { newEmail: email });
    }
  }
  async function sendVerificationEmail() {
    const { error } = await supabase.auth.signInWithOtp({
      email: user!.email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (error) {
      console.error(error);
      setError(t("errors.unexpected_retry"));
    } else {
      setVerificationMailSent(true);
      setError(null);
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
            disabled={!isDirty || !!error}
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
                  onPress={sendVerificationEmail}
                />
              </>
            )}
          {verificationMailSent && (
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
