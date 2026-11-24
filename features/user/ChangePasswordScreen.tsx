import * as Sentry from "@sentry/react-native";
import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { ChangePasswordScreenProps } from "./navigation/user-routes";
import { supabase } from "@/supabase/supabase";
import { Body, H2 } from "@/theme/Typography";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useDiscardChangesPrompt } from "@/navigation/useDiscardChangesPrompt";

export function ChangePasswordScren({ navigation }: ChangePasswordScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setUser } = useSession();
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    watch,
  } = useForm<{ password: string; passwordRepeat: string }>();
  // Asks before leaving with unsaved changes
  // The save calls Supabase directly (no mutation): no prompt while it runs and navigates back
  useDiscardChangesPrompt(isDirty, isSubmitting);

  const password = watch("password");

  async function onSubmit({ password }: { password: string }) {
    const { error, data } = await supabase.auth.updateUser({
      password,
    });
    if (error || !data) {
      // Auth errors with a 4xx status are user errors (e.g. weak or same password), only
      // the rest is worth a report
      if (error && !(error.status !== undefined && error.status < 500)) {
        Sentry.captureException(error);
      }
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
        headerTitleOnScroll={t("users.new_password")}
      >
        <H2>{t("users.new_password")}</H2>
        <View
          style={{ flex: 1, marginTop: theme.spacing.m, gap: theme.spacing.s }}
        >
          <RHTextInput
            control={control}
            autoCapitalize="none"
            name="password"
            label={t("forms.labels.password")}
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
