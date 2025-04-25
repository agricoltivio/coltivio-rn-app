import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { ResetPasswordScreenProps } from "@/features/auth/navigation/auth-routes";
import { supabase } from "@/supabase/supabase";
import { Body, H2 } from "@/theme/Typography";
import { useUrl } from "@/utils/url-context";
import * as Sentry from "@sentry/react-native";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

type FromValues = {
  password: string;
  passwordRepeat: string;
};

export function ResetPasswordScreen({ navigation }: ResetPasswordScreenProps) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<FromValues>();
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const { t } = useTranslation();
  const theme = useTheme();
  const [authState, setAutState] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);

  const password = watch("password");

  const { url } = useUrl();
  useEffect(() => {
    const createSessionFromUrl = async () => {
      if (!url) {
        return;
      }
      const { queryParams } = Linking.parse(url.replaceAll("#", "?"));
      if (!queryParams) {
        setUrlError(t("errors.unexpected"));
        return;
      }
      if (queryParams.error) {
        switch (queryParams.error) {
          case "access_denied":
            setUrlError(t("errors.link_expired"));
            break;
          default: {
            setError(t("errors.unexpected"));
          }
        }
        console.error(queryParams.error);
        return;
      }
      const { access_token, refresh_token } = queryParams;
      if (!access_token || !refresh_token) {
        console.error(
          "Missing access_token or refresh_token",
          access_token != null,
          refresh_token != null
        );
        setUrlError(t("errors.unexpected"));
        return;
      }
      setAutState({
        accessToken: access_token as string,
        refreshToken: refresh_token as string,
      });
    };
    createSessionFromUrl();
  }, [url]);

  async function onSubmit({ password }: FromValues) {
    const { error } = await supabase.auth.setSession({
      access_token: authState!.accessToken,
      refresh_token: authState!.refreshToken,
    });
    if (error) {
      console.error("set session error", error);
      Sentry.captureException(error);
      setError(t("errors.unexpected"));
      return;
    }
    const { error: passwordUpdateError } = await supabase.auth.updateUser({
      password,
    });
    if (passwordUpdateError) {
      console.error(passwordUpdateError);
      Sentry.captureException(passwordUpdateError);
    }
  }
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          {urlError != null ? (
            <Button
              title={t("buttons.back")}
              onPress={() => navigation.navigate("SignIn")}
            />
          ) : (
            <Button
              title={t("buttons.save")}
              onPress={handleSubmit(onSubmit)}
              disabled={!isDirty || urlError != null}
            />
          )}
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

        <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.s }}>
          {urlError ? (
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
              <Body style={{ fontWeight: 800, color: "white" }}>
                {urlError}
              </Body>
            </View>
          ) : (
            <>
              <RHTextInput
                control={control}
                autoCapitalize="none"
                name="password"
                label={t("forms.labels.password")}
                placeholder={t("forms.placeholders.password_requirements")}
                secureTextEntry
                rules={{
                  required: {
                    value: true,
                    message: t("forms.validation.required"),
                  },
                  minLength: {
                    value: 6,
                    message: t("forms.validation.password_min_length"),
                  },
                }}
                error={errors.password?.message}
              />
              <RHTextInput
                control={control}
                autoCapitalize="none"
                name="passwordRepeat"
                label={t("forms.labels.password_repeat")}
                secureTextEntry
                rules={{
                  validate: (value) => {
                    if (value !== password) {
                      return t("forms.validation.password_repeat_invalid");
                    }
                  },
                }}
                error={errors.passwordRepeat?.message}
              />
            </>
          )}
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
