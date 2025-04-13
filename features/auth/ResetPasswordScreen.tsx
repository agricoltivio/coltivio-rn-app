import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { Body, H2 } from "@/theme/Typography";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { supabase } from "@/supabase/supabase";
import { useEffect, useState } from "react";
import { ResetPasswordScreenProps } from "@/navigation/rootStackTypes";
import { useSession } from "@/auth/SessionProvider";
import * as Linking from "expo-linking";

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
  const { setUser, setSession } = useSession();
  const url = Linking.useURL();

  const password = watch("password");

  useEffect(() => {
    const createSessionFromUrl = async () => {
      if (!url) {
        return;
      }
      const { queryParams } = Linking.parse(url.replaceAll("#", "?"));
      if (!queryParams) {
        setUrlError(t("forgot_password.link_expired"));
        return;
      }
      console.log("queryParams", queryParams);
      if (queryParams.error) {
        switch (queryParams.error) {
          case "access_denied":
            setUrlError(t("forgot_password.link_expired"));
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
      const { data, error } = await supabase.auth.setSession({
        access_token: access_token as string,
        refresh_token: refresh_token as string,
      });
      if (error) {
        console.error(error);
        setError(t("errors.unexpected"));
        return;
      }
      if (!data.session) {
        console.error("Missing session");
        setError(t("errors.unexpected"));
        return;
      }
      setSession(data.session!);
    };
    createSessionFromUrl();
  }, [url]);

  async function onSubmit({ password }: FromValues) {
    const { error, data } = await supabase.auth.updateUser({
      password,
    });
    if (error || !data) {
      console.error(error?.code || error?.message);
      setError(t("errors.unexpected_retry"));
    } else {
      setUser(data.user);
      navigation.goBack();
    }
  }
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            title={t("buttons.save")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || urlError != null}
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
