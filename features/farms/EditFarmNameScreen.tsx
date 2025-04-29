import { useTheme } from "styled-components/native";
import { useFarmQuery, useUpdateFarmMutation } from "./farms.hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ContentView } from "@/components/containers/ContentView";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { RHTextInput } from "@/components/inputs/RHTextnput";
import { H2, Body } from "@/theme/Typography";
import { View } from "react-native";
import { EditFarmNameScreenProps } from "./navigation/farm-routes";
import { Button } from "@/components/buttons/Button";
import { ScrollView } from "@/components/views/ScrollView";
import { useTranslation } from "react-i18next";

export function EditFarmNameScreen({ navigation }: EditFarmNameScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { farm } = useFarmQuery();

  const updateFarmMutation = useUpdateFarmMutation(() => navigation.goBack());
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<{ name: string }>({
    values: farm,
  });

  async function onSubmit({ name }: { name: string }) {
    updateFarmMutation.mutate({ name });
  }

  return (
    <ContentView
      footerComponent={
        <BottomActionContainer>
          <Button
            onPress={handleSubmit(onSubmit)}
            title={t("buttons.save")}
            disabled={!isDirty || updateFarmMutation.isPending}
            loading={updateFarmMutation.isPending}
          />
        </BottomActionContainer>
      }
    >
      <ScrollView
        keyboardAware
        showHeaderOnScroll
        headerTitleOnScroll={t("farm.farm_name")}
      >
        <H2>{t("farm.farm_name")}</H2>
        <View style={{ flex: 1, marginTop: theme.spacing.m }}>
          <RHTextInput
            name="name"
            control={control}
            label={t("forms.labels.farm_name")}
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.name?.message}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
