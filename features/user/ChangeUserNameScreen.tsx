import { useSession } from "@/auth/SessionProvider";
import { queryKeys } from "@/cache/query-keys";
import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { supabase } from "@/supabase/supabase";
import { Body, H2 } from "@/theme/Typography";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { ChangeUserNameScreenProps } from "./navigation/user-routes";
import { useUserQuery } from "./users.hooks";

export function ChangeUserNameScreen({
  navigation,
}: ChangeUserNameScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useUserQuery();
  const { setUser } = useSession();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<{ name: string }>({
    defaultValues: { name: user?.fullName ?? undefined },
  });

  async function onSubmit({ name }: { name: string }) {
    const { error, data } = await supabase.auth.updateUser({
      data: { full_name: name },
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
        headerTitleOnScroll={t("users.change_display_name")}
      >
        <H2>{t("users.change_display_name")}</H2>
        <View style={{ flex: 1, marginTop: theme.spacing.m }}>
          <RHTextInput
            name="name"
            control={control}
            label={t("forms.labels.name")}
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
