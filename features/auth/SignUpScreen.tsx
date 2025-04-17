import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { supabase } from "@/supabase/supabase";
import { Body, H2 } from "@/theme/Typography";
import * as Sentry from "@sentry/react-native";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

type FormValues = {
  name: string;
  email: string;
  password: string;
  passwordRepeat: string;
};

export function SignUpScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const { setSession } = useSession();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setError: setFormError,
    watch,
  } = useForm<FormValues>();
  const password = watch("password");

  async function onSubmit({ name, email, password }: FormValues) {
    setFetching(true);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) {
      switch (error.message) {
        case "user_already_exists": {
          setFormError("email", {
            message: t("signup.errors.email_taken"),
          });
          break;
        }
        default: {
          setError(t("signup.errors.unexpected"));
        }
      }
    } else if (!data?.session) {
      setError(t("signup.errors.unexpected"));
    } else {
      setSession(data?.session);
    }
    setFetching(false);
    console.error(error);
    Sentry.captureException(error);
  }

  return (
    <ContentView headerVisible>
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t("signup.create_account")}
        keyboardAware
      >
        <H2 style={{ color: theme.colors.primary }}>
          {t("signup.create_account")}
        </H2>
        <View style={{ marginTop: theme.spacing.xl, gap: theme.spacing.s }}>
          <RHTextInput
            control={control}
            name="name"
            label={t("forms.labels.name")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors?.name?.message}
          />
          <RHTextInput
            control={control}
            autoCapitalize="none"
            name="email"
            label={t("forms.labels.email")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.email?.message}
          />
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
      <Button
        style={{ marginTop: theme.spacing.xl }}
        title={t("buttons.signup")}
        onPress={handleSubmit(onSubmit)}
        loading={fetching}
        disabled={!isDirty || fetching}
      />
    </ContentView>
  );
}
