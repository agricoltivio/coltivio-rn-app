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
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";
import { AddFertilizerApplicationSelectDateScreenProps } from "@/navigation/rootStackTypes";
import { useTranslation } from "react-i18next";

type FormValues = {
  date: Date;
};
export function AddFertilizerApplicationSelectDateScreen({
  navigation,
}: AddFertilizerApplicationSelectDateScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setFertilizerApplication, reset } =
    useCreateFertilizerApplicationStore();

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
    setFertilizerApplication({ date: date.toISOString().split("T")[0] });

    navigation.navigate("AddFertilizerApplicationSelectFertilizer");
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
        headerTitleOnScroll={t("fertilizer_application.select_date.heading")}
        keyboardAware
      >
        <H2>{t("fertilizer_application.select_date.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.l }}
        >
          <RHDatePicker
            name="date"
            control={control}
            label={t("forms.labels.date")}
            mode="date"
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
