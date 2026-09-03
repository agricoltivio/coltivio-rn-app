import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { BrandedContentView } from "@/components/containers/BrandedContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { ForgotPasswordScreenProps } from "@/features/auth/navigation/auth-routes";
import { supabase } from "@/supabase/supabase";
import { Body, H2, H3 } from "@/theme/Typography";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";

const redirectTo = `${process.env.EXPO_PUBLIC_WEB_URL}/reset-password`;

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
  const [loading, setLoading] = useState(false);

  async function onSubmit({ email }: { email: string }) {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    setLoading(false);
    if (error) {
      console.error(error);
      setError(t("errors.unexpected"));
    } else {
      navigation.navigate("PasswordResetLinkSent", { email });
    }
  }
  return (
    <BrandedContentView
      footerComponent={
        <BottomActionContainer transparent>
          <Button
            title={t("buttons.send_email")}
            type="secondary"
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || loading}
          />
        </BottomActionContainer>
      }
    >
      {/* No showHeaderOnScroll here: it repaints the header white on scroll,
          which would cut a light bar across the gradient. */}
      <ScrollView keyboardAware>
        <H2 style={{ color: theme.colors.offWhite }}>
          {t("forgot_password.reset_password")}
        </H2>
        <H3 style={{ marginTop: theme.spacing.s, color: theme.colors.offWhite }}>
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
    </BrandedContentView>
  );
}
