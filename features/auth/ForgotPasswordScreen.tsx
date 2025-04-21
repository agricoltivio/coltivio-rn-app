import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2, H3 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { makeRedirectUri } from "expo-auth-session";
import { supabase } from "@/supabase/supabase";
import { useState } from "react";
import { ForgotPasswordScreenProps } from "@/features/auth/navigation/auth-routes";

const redirectTo = makeRedirectUri({
  scheme: "ch.coltivio",
  path: "ResetPassword",
});

export function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<{ email: string }>();
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const theme = useTheme();

  console.log("redireto", redirectTo);
  console.log("foo");
  async function onSubmit({ email }: { email: string }) {
    // const { error } = await supabase.auth.signInWithOtp({
    //   email: email,
    //   options: { emailRedirectTo: redirectTo },
    // });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      console.error(error);
      setError(t("errors.unexpected"));
    } else {
      navigation.navigate("PasswordResetLinkSent");
    }
  }
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.send_email")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("forgot_password.reset_password")}
        keyboardAware
      >
        <H2 style={{ color: theme.colors.primary }}>
          {t("forgot_password.reset_password")}
        </H2>
        <H3 style={{ marginTop: theme.spacing.s }}>
          {t("forgot_password.enter_email")}
        </H3>
        <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.s }}>
          <RHTextInput
            control={control}
            name="email"
            label={t("forms.labels.email")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors?.email?.message}
          />
        </View>
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
      </ScrollView>
    </ContentView>
  );
}
