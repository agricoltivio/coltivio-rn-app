import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { AddCropProtectionApplicationSelectDateScreenProps } from "@/navigation/rootStackTypes";
import { useAddCropProtectionApplicationStore } from "./cropProtectionApplication.store";
import { useTranslation } from "react-i18next";

type FormValues = {
  date: Date;
};
export function AddCropProtectionApplicationSelectDateScreen({
  navigation,
}: AddCropProtectionApplicationSelectDateScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setData, reset } = useAddCropProtectionApplicationStore();

  useEffect(() => {
    return () => reset();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date(),
    },
  });

  function onSubmit({ date }: FormValues) {
    setData({ dateTime: date.toISOString() });

    navigation.navigate("AddCropProtectionApplicationSelectProduct");
  }

  return (
    <ContentView
      headerVisible
      footerComponent={
        <BottomActionContainer>
          <Button title={t("buttons.next")} onPress={handleSubmit(onSubmit)} />
        </BottomActionContainer>
      }
    >
      <ScrollView
        showHeaderOnScroll
        headerTitleOnScroll={t(
          "crop_protection_applications.select_date.heading"
        )}
        keyboardAware
      >
        <H2>{t("crop_protection_applications.select_date.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.l }}
        >
          <RHDatePicker
            name="date"
            control={control}
            label={t("forms.labels.date")}
            mode="datetime"
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.date?.message}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
