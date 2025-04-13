import { Button } from "@/components/buttons/Button";
import { BottomActionContainer } from "@/components/containers/BottomActionContainer";
import { ContentView } from "@/components/containers/ContentView";
import { RHNumberInput } from "@/components/inputs/RHNumberInput";
import { ScrollView } from "@/components/views/ScrollView";
import { H2 } from "@/theme/Typography";
import React from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { useTheme } from "styled-components/native";
import { useCreateFertilizerApplicationStore } from "./fertilizerApplication.store";
import { AddFertilizerApplicationSelectQuantityScreenProps } from "@/navigation/rootStackTypes";
import { useTranslation } from "react-i18next";

type FormValues = {
  totalNumberOfApplications: string;
};
export function AddFertilizerApplicationSelectQuantityScreen({
  navigation,
}: AddFertilizerApplicationSelectQuantityScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const { setTotalNumberOfApplications, totalNumberOfApplications } =
    useCreateFertilizerApplicationStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      totalNumberOfApplications: totalNumberOfApplications?.toString(),
    },
  });

  function onSubmit({ totalNumberOfApplications }: FormValues) {
    setTotalNumberOfApplications(Number(totalNumberOfApplications));

    navigation.navigate("AddFertilizerApplicationSelectPlots");
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
          "fertilizer_application.select_quantity.heading"
        )}
        keyboardAware
      >
        <H2>{t("fertilizer_application.select_quantity.heading")}</H2>
        <View
          style={{ gap: theme.spacing.s, flex: 1, marginTop: theme.spacing.m }}
        >
          <RHNumberInput
            name="totalNumberOfApplications"
            keyboardType="number-pad"
            control={control}
            label={t("forms.labels.amount_of_loads")}
            float
            rules={{
              required: {
                value: true,
                message: t("forms.validation.required"),
              },
            }}
            error={errors.totalNumberOfApplications?.message}
          />
        </View>
      </ScrollView>
    </ContentView>
  );
}
