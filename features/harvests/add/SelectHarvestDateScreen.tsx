import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHDatePicker } from "@/components/inputs/RHDatePicker";
import { ScrollView } from "@/components/views/ScrollView";
import { SelectHarvestDateScreenProps } from "../navigation/harvest-routes";
import { H2 } from "@/theme/Typography";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateHarvestStore } from "./harvest.store";
import { dateToDateString } from "@/utils/date";

type FormValues = {
  date: Date;
};
export function SelectHarvestDateScreen({
  navigation,
}: SelectHarvestDateScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setHarvest, reset } = useCreateHarvestStore();

  useEffect(() => {
    return () => reset();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date(),
    },
  });

  function onSubmit({ date }: FormValues) {
    setHarvest({ date: dateToDateString(date) });

    navigation.navigate("SelectHarvestCrop");
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
        headerTitleOnScroll={t("harvests.labels.select_date.heading")}
        keyboardAware
      >
        <H2>{t("harvests.labels.select_date.heading")}</H2>
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
