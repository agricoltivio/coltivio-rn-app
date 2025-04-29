import { useSession } from "@/auth/SessionProvider";
import { Button } from "@/components/buttons/Button";
import { Card } from "@/components/card/Card";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { ScrollView } from "@/components/views/ScrollView";
import { DeleteFarmScreenProps } from "./navigation/farm-routes";
import { H2, Label, Subtitle } from "@/theme/Typography";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Switch, View } from "react-native";
import { useTheme } from "styled-components/native";
import { useDeleteFarmMutation, useFarmQuery } from "./farms.hooks";
import { useTranslation } from "react-i18next";

export function DeleteFarmScreen({}: DeleteFarmScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [deleteAccount, setDeleteAccount] = useState(false);
  const { farm } = useFarmQuery();
  const { clearSession } = useSession();

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm<{ name: string }>();

  const deleteFarmMutation = useDeleteFarmMutation(() => {
    if (deleteAccount) {
      clearSession();
    }
  });

  function onSubmit() {
    deleteFarmMutation.mutate(deleteAccount);
  }
  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            type="danger"
            title={t("farm.delete_farm")}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || deleteFarmMutation.isPending}
            loading={deleteFarmMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={t("farm.delete_farm")}
      >
        <H2>{t("farm.delete_farm")}</H2>
        <Card
          style={{
            backgroundColor: theme.colors.danger,
            marginTop: theme.spacing.m,
          }}
        >
          <H2 style={{ color: theme.colors.white }}>Danger Zone!</H2>
          <Subtitle
            style={{ color: theme.colors.white, marginTop: theme.spacing.m }}
          >
            {t("common.all_entries_will_be_deleted")}
          </Subtitle>
          <Subtitle
            style={{ color: theme.colors.white, marginTop: theme.spacing.s }}
          >
            {t("farm.enter_farm_name_to_delete")}
          </Subtitle>
          <Subtitle
            style={{ color: theme.colors.white, marginTop: theme.spacing.s }}
          >
            {t("farm.chose_option_to_delete_account")}
          </Subtitle>
        </Card>
        <View style={{ flexDirection: "row", marginTop: theme.spacing.xl }}>
          <Label style={{ flex: 1 }}>{t("farm.delete_account")}</Label>
          <Switch
            value={deleteAccount}
            onChange={() => setDeleteAccount((prev) => !prev)}
          />
        </View>

        <View style={{ marginTop: theme.spacing.l }}>
          <RHTextInput
            name="name"
            placeholder={farm?.name}
            control={control}
            label={t("forms.labels.farm_name")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
              validate: (value) => {
                if (value !== farm?.name) {
                  return t("forms.validation.name_mismatch");
                }
              },
            }}
            error={errors.name?.message}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
